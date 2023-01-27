# Authentication

The Douglas Data Capture Platform features a role-based authentication system. Each user is assigned a specific role, which may be one of:
- Admin
- User

Admin users have access to all functionality in the platform, including:
- Subject Registration
- Data Extraction
- Data Visualization
- Instrument Creation
- Administering Instruments

Users, on the other hand, may access the following functionality:
- Subject Registration
- Data Extraction*
- Data Visualization*
- Administering Instruments*

> **Important Note:** For items marked with an asterisk, the specific data/instruments available to the user are determined by the clinic(s) to which they belong. 

However, unlike admins, users are not permitted to access all data associated with a given feature. Rather, users are associated with one or more clinics, which determine their access permissions. *When a user affiliated with multiple clinics attempts to log into the platform, they will be prompted to select the clinic for the current session. The permissions of the user are then determined by the clinic associated with the current login session.*

