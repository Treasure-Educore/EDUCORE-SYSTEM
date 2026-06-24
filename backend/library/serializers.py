from rest_framework import serializers

from .models import BookCategory, Book, LibraryCard, BookIssue


class BookCategorySerializer(serializers.ModelSerializer):
    educationLevel = serializers.CharField(source='education_level', read_only=True)
    subject = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = BookCategory
        fields = ('id', 'name', 'educationLevel', 'subject', 'description')


class BookListSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source='subject.name', read_only=True)
    educationLevel = serializers.CharField(source='education_level', read_only=True)
    totalCopies = serializers.IntegerField(source='total_copies', read_only=True)
    availableCopies = serializers.IntegerField(source='available_copies', read_only=True)
    isAvailable = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ('id', 'title', 'author', 'subject', 'educationLevel', 'totalCopies', 'availableCopies', 'isAvailable', 'condition', 'location')

    def get_isAvailable(self, obj):
        return obj.is_available()


class BookDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'


class BookWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'


class LibraryCardSerializer(serializers.ModelSerializer):
    cardNumber = serializers.CharField(source='card_number', read_only=True)
    studentName = serializers.CharField(source='student.full_name', read_only=True)
    studentNumber = serializers.CharField(source='student.student_number', read_only=True)
    issuedDate = serializers.DateField(source='issued_date', read_only=True)
    expiryDate = serializers.DateField(source='expiry_date', read_only=True)
    isActive = serializers.BooleanField(source='is_active', read_only=True)

    class Meta:
        model = LibraryCard
        fields = ('id', 'cardNumber', 'studentName', 'studentNumber', 'issuedDate', 'expiryDate', 'isActive')


class BookIssueSerializer(serializers.ModelSerializer):
    bookTitle = serializers.CharField(source='book.title', read_only=True)
    studentName = serializers.CharField(source='library_card.student.full_name', read_only=True)
    cardNumber = serializers.CharField(source='library_card.card_number', read_only=True)
    issueDate = serializers.DateField(source='issue_date', read_only=True)
    dueDate = serializers.DateField(source='due_date', read_only=True)
    returnDate = serializers.DateField(source='return_date', read_only=True)
    status = serializers.CharField(read_only=True)
    fineAmount = serializers.DecimalField(source='fine_amount', max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = BookIssue
        fields = ('id', 'bookTitle', 'studentName', 'cardNumber', 'issueDate', 'dueDate', 'returnDate', 'status', 'fineAmount', 'notes')
