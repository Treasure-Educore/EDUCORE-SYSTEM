from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('staff', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='staffprofile',
            name='staff_number',
            field=models.CharField(max_length=20, unique=True, blank=True, editable=False),
        ),
    ]
