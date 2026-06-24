from django.db import migrations, models
import uuid
import django.conf


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('students', '0001_initial'),
        ('staff', '0001_initial'),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Term',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=20)),
                ('academic_year', models.CharField(max_length=9)),
                ('is_current', models.BooleanField(default=False)),
            ],
            options={
                'ordering': ['-academic_year', 'name'],
                'unique_together': {('name', 'academic_year')},
            },
        ),
        migrations.CreateModel(
            name='Assessment',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('label', models.CharField(max_length=20)),
                ('max_score', models.PositiveIntegerField()),
                ('order', models.PositiveIntegerField(default=1)),
                ('term', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='assessments', to='marks.term')),
            ],
            options={
                'ordering': ['order'],
                'unique_together': {('label', 'term')},
            },
        ),
        migrations.CreateModel(
            name='Mark',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('score', models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)),
                ('submitted_at', models.DateTimeField(null=True, blank=True)),
                ('is_submitted', models.BooleanField(default=False)),
                ('assessment', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='marks', to='marks.assessment')),
                ('student', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='marks', to='students.student')),
                ('subject', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='marks', to='staff.subject')),
                ('teacher', models.ForeignKey(on_delete=models.deletion.SET_NULL, related_name='marks_entered', to=django.conf.settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
                'unique_together': {('student', 'subject', 'assessment')},
            },
        ),
        migrations.CreateModel(
            name='MarksSummary',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('test1_score', models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)),
                ('test2_score', models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)),
                ('exam_score', models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)),
                ('total', models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)),
                ('grade', models.CharField(max_length=2, blank=True)),
                ('position', models.PositiveIntegerField(null=True, blank=True)),
                ('is_submitted', models.BooleanField(default=False)),
                ('student', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='summaries', to='students.student')),
                ('subject', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='summaries', to='staff.subject')),
                ('term', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='summaries', to='marks.term')),
            ],
            options={
                'unique_together': {('student', 'subject', 'term')},
            },
        ),
    ]
