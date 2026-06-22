from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in self.allowed_roles
        )


class IsAdmin(RolePermission):
    allowed_roles = ("admin",)


class IsHeadTeacher(RolePermission):
    allowed_roles = ("head_teacher",)


class IsDOS(RolePermission):
    allowed_roles = ("dos",)


class IsBursar(RolePermission):
    allowed_roles = ("bursar",)


class IsTeacher(RolePermission):
    allowed_roles = ("teacher",)


class IsAdminOrHeadTeacher(RolePermission):
    allowed_roles = ("admin", "head_teacher")


class IsTeacherOrDOS(RolePermission):
    allowed_roles = ("teacher", "dos")
