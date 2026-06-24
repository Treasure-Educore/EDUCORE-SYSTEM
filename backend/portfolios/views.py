from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import PortfolioItem
from .serializers import PortfolioItemSerializer


class PortfolioItemViewSet(viewsets.ModelViewSet):
    serializer_class = PortfolioItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = PortfolioItem.objects.select_related("student", "uploaded_by").all()
        student_number = self.request.query_params.get("studentNumber")
        stream_id = self.request.query_params.get("streamId")
        if student_number:
            qs = qs.filter(student__student_number=student_number)
        if stream_id:
            qs = qs.filter(student__stream_id=stream_id)
        return qs.order_by("-date")

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
