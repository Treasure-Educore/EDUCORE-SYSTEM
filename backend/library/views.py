from datetime import date
from django.db import models

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Book, LibraryCard, BookIssue
from .serializers import (
    BookListSerializer, BookDetailSerializer, BookWriteSerializer,
    LibraryCardSerializer, BookIssueSerializer
)


class BookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Book.objects.select_related('category', 'subject').all()
    filterset_fields = ['education_level', 'subject', 'condition']
    search_fields = ['title', 'author', 'isbn']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return BookWriteSerializer
        if self.action in ('retrieve',):
            return BookDetailSerializer
        return BookListSerializer


class LibraryCardViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = LibraryCard.objects.select_related('student').all()
    serializer_class = LibraryCardSerializer

    @action(detail=False, methods=['post'], url_path='issue-to-class')
    def issue_to_class(self, request):
        stream_id = request.data.get('streamId')
        from students.models import Student
        students = Student.objects.filter(stream_id=stream_id, status='Active')
        created = 0
        for student in students:
            if not hasattr(student, 'library_card'):
                LibraryCard.objects.create(
                    student=student,
                    issued_by=request.user
                )
                created += 1
        return Response({'detail': f'Library cards issued to {created} students.'})

    @action(detail=True, methods=['get'], url_path='print')
    def print_card(self, request, pk=None):
        from reportlab.lib import colors
        from reportlab.lib.units import cm
        import io
        from reportlab.pdfgen import canvas as pdfcanvas

        card = self.get_object()
        student = card.student
        CARD_W, CARD_H = 8.5 * cm, 5.5 * cm
        GREEN = colors.HexColor('#16A34A')
        NAVY = colors.HexColor('#0F172A')
        buffer = io.BytesIO()

        c = pdfcanvas.Canvas(buffer, pagesize=(CARD_W, CARD_H))

        # Green header band
        c.setFillColor(GREEN)
        c.rect(0, CARD_H - 1.2 * cm, CARD_W, 1.2 * cm, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont('Helvetica-Bold', 6.5)
        c.drawCentredString(CARD_W / 2, CARD_H - 0.8 * cm, 'GREENFIELD SECONDARY SCHOOL')
        c.drawCentredString(CARD_W / 2, CARD_H - 1.05 * cm, 'STUDENT LIBRARY CARD')

        # Photo placeholder box
        c.setFillColor(colors.HexColor('#F1F5F9'))
        c.setStrokeColor(colors.HexColor('#CBD5E1'))
        c.rect(0.3 * cm, 1.2 * cm, 1.8 * cm, 2.3 * cm, fill=1, stroke=1)
        c.setFillColor(colors.HexColor('#94A3B8'))
        c.setFont('Helvetica', 5)
        c.drawCentredString(1.2 * cm, 2.2 * cm, 'PHOTO')

        # Student info
        c.setFillColor(NAVY)
        c.setFont('Helvetica-Bold', 7.5)
        c.drawString(2.4 * cm, CARD_H - 1.6 * cm, student.full_name[:30])
        c.setFont('Helvetica', 6)
        info_lines = [
            f"Adm No: {student.student_number}",
            f"Card No: {card.card_number}",
            f"Class: {student.stream.display_name() if student.stream else '—'}",
            f"Valid Until: {card.expiry_date.strftime('%d %b %Y') if card.expiry_date else '—'}",
        ]
        y = CARD_H - 2.0 * cm
        for line in info_lines:
            c.drawString(2.4 * cm, y, line)
            y -= 0.38 * cm

        # School seal placeholder
        c.setStrokeColor(GREEN)
        c.setFillColor(colors.white)
        c.circle(7.5 * cm, 0.9 * cm, 0.7 * cm, fill=1, stroke=1)
        c.setFillColor(GREEN)
        c.setFont('Helvetica-Bold', 4)
        c.drawCentredString(7.5 * cm, 1.0 * cm, 'SEAL')

        # Bottom green bar
        c.setFillColor(GREEN)
        c.rect(0, 0, CARD_W, 0.35 * cm, fill=1, stroke=0)

        c.save()
        buffer.seek(0)
        from django.http import HttpResponse
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="library_card_{student.student_number}.pdf"'
        return response


class BookIssueViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = BookIssue.objects.select_related('book', 'library_card__student').all()
    serializer_class = BookIssueSerializer
    filterset_fields = ['status']

    @action(detail=True, methods=['patch'], url_path='return')
    def return_book(self, request, pk=None):
        issue = self.get_object()
        if issue.status == 'returned':
            return Response({'detail': 'Book already returned.'}, status=400)
        issue.mark_returned()
        return Response(BookIssueSerializer(issue).data)


class LibrarySummaryView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        totalBooks = Book.objects.count()
        availableBooks = Book.objects.aggregate(total=models.Sum('available_copies'))['total'] or 0
        issuedBooks = BookIssue.objects.filter(status='issued').count()
        overdueBooks = BookIssue.objects.filter(status='overdue').count()
        totalCards = LibraryCard.objects.count()
        activeCards = LibraryCard.objects.filter(is_active=True).count()
        return Response({
            'totalBooks': totalBooks,
            'availableBooks': availableBooks,
            'issuedBooks': issuedBooks,
            'overdueBooks': overdueBooks,
            'totalCards': totalCards,
            'activeCards': activeCards,
        })
