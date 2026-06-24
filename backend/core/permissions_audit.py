"""
Permission matrix for the School Management System API.

This file documents the expected allowed roles for every public API endpoint.
Tests and other audit tooling can import `PERMISSION_MATRIX` from here.
"""

PERMISSION_MATRIX = {
    # Auth
    'POST /api/auth/login/':           ['anyone'],
    'POST /api/auth/refresh/':         ['anyone'],
    'GET  /api/health/':               ['anyone'],

    # Students
    'GET  /api/students/':             ['admin','head_teacher','dos','bursar','teacher'],
    'POST /api/students/':             ['admin','head_teacher'],
    'PATCH /api/students/{id}/':       ['admin','head_teacher'],
    'DELETE /api/students/{id}/':      ['admin'],
    'GET  /api/streams/':              ['all_authenticated'],
    'GET  /api/class-levels/':         ['all_authenticated'],
    'GET  /api/clubs/':                ['all_authenticated'],
    'GET  /api/dormitories/':          ['all_authenticated'],

    # Staff
    'GET  /api/staff/':                ['admin','head_teacher','dos'],
    'POST /api/staff/':                ['admin','head_teacher'],
    'PATCH /api/staff/{id}/':          ['admin','head_teacher'],
    'DELETE /api/staff/{id}/':         ['admin'],
    'GET  /api/subjects/':             ['all_authenticated'],
    'GET  /api/departments/':          ['all_authenticated'],

    # Marks
    'GET  /api/marks/':                ['teacher','dos','admin','head_teacher'],
    'POST /api/marks/submit/':         ['teacher'],
    'GET  /api/marks/status/':         ['dos','admin','head_teacher'],
    'GET  /api/terms/':                ['all_authenticated'],

    # Timetable
    'GET  /api/timetable/slots/':      ['all_authenticated'],
    'POST /api/timetable/slots/':      ['admin','head_teacher','dos'],
    'PATCH /api/timetable/slots/{id}/':['admin','head_teacher','dos'],
    'DELETE /api/timetable/slots/{id}/':['admin','head_teacher','dos'],
    'GET  /api/timetable/periods/':    ['all_authenticated'],

    # Schemes & Plans
    'GET  /api/schemes/':              ['all_authenticated'],
    'POST /api/schemes/':              ['teacher'],
    'PATCH /api/schemes/{id}/':        ['teacher'],
    'PATCH /api/schemes/{id}/approve/':['dos','head_teacher','admin'],
    'PATCH /api/schemes/{id}/request-revision/': ['dos','head_teacher','admin'],
    'GET  /api/lesson-plans/':         ['all_authenticated'],
    'POST /api/lesson-plans/':         ['teacher'],
    'GET  /api/submissions/':          ['all_authenticated'],
    'PATCH /api/submissions/{id}/review/': ['dos','head_teacher','admin'],

    # Fees
    'GET  /api/fees/':                 ['bursar','admin','head_teacher'],
    'POST /api/fees/payments/':        ['bursar','admin'],
    'GET  /api/fees/summary/':         ['bursar','admin','head_teacher'],
    'GET  /api/bursaries/':            ['bursar','admin'],
    'POST /api/bursaries/':            ['bursar','admin'],

    # Assessments & Portfolios
    'GET  /api/assessments/':          ['teacher','dos','admin','head_teacher'],
    'POST /api/assessments/bulk-submit/': ['teacher'],
    'GET  /api/portfolios/':           ['all_authenticated'],
    'POST /api/portfolios/':           ['teacher'],

    # Reports & Analytics
    'GET  /api/reports/student/{id}/':     ['all_authenticated'],
    'GET  /api/reports/student/{id}/pdf/': ['all_authenticated'],
    'GET  /api/analytics/summary/':        ['dos','admin','head_teacher'],
    'GET  /api/dashboard/':                ['all_authenticated'],

    # Attendance
    'GET  /api/attendance/':               ['teacher','dos','admin','head_teacher'],
    'POST /api/attendance/bulk-mark/':     ['teacher'],
    'GET  /api/attendance/summary/':       ['dos','admin','head_teacher'],

    # Announcements
    'GET  /api/announcements/':            ['all_authenticated'],
    'POST /api/announcements/':            ['admin','head_teacher'],
    'PATCH /api/announcements/{id}/':      ['admin','head_teacher'],
    'DELETE /api/announcements/{id}/':     ['admin'],
}
