from django.core.management.base import BaseCommand
from staff.models import StaffProfile, Subject


class Command(BaseCommand):
    help = 'Sets up staff subject associations for seed data'

    def handle(self, *args, **options):
        """
        Assigns subjects to staff members based on mockData
        """
        try:
            # Get subjects
            math = Subject.objects.get(code='MATH')
            english = Subject.objects.get(code='ENG')
            physics = Subject.objects.get(code='PHY')
            chemistry = Subject.objects.get(code='CHEM')
            biology = Subject.objects.get(code='BIO')
            agriculture = Subject.objects.get(code='AGR')
            
            # Get staff members by email
            staff_subjects = {
                'jane.n@greenfield.edu': [math, physics],
                'samuel.m@greenfield.edu': [english],
                'ruth.a@greenfield.edu': [chemistry],
                'daniel.o@greenfield.edu': [biology, agriculture],
            }
            
            for email, subjects in staff_subjects.items():
                try:
                    staff = StaffProfile.objects.get(user__email=email)
                    staff.subjects.set(subjects)
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Successfully assigned {len(subjects)} subjects to {email}'
                        )
                    )
                except StaffProfile.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'Staff profile not found for {email}')
                    )
                    
        except Subject.DoesNotExist as e:
            self.stdout.write(
                self.style.ERROR(f'Subject not found: {str(e)}')
            )
