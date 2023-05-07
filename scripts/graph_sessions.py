import os

from datetime import datetime

import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import requests

API_URL = 'https://datacapture.douglasneuroinformatics.ca/api'

def get_access_token() -> str:
    response = requests.post(f"{API_URL}/v1/auth/login", json={
        'username': os.environ.get('PROD_USERNAME'),
        'password': os.environ.get('PROD_PASSWORD')
    })
    return response.json().get('accessToken')

access_token = get_access_token()

response = requests.get(f"{API_URL}/v1/users", headers={
    'Authorization': f"Bearer {access_token}"
})

# admin is running this so should not be included
users: list[dict] = [user for user in response.json() if user['username'] != 'admin']

sessions: list[datetime] = []
for user in users:
    for session in user['sessions']:
        # Some sessions were recorded before time was added
        try:
            time = session['time']
        except KeyError:
            continue
        # Date.now() creates in ms while Python expects seconds
        sessions.append(datetime.fromtimestamp(time / 1000))

# a record of the number of logins at each timestamp
data: dict[datetime, int] = {}
for user in users:
    for session in user['sessions']:
        # Some sessions were recorded before time was added
        try:
            time = session['time']
        except KeyError:
            continue
        # Date.now() creates in ms while Python expects seconds
        exact = datetime.fromtimestamp(time / 1000)
        session_date = datetime(exact.year, exact.month, exact.day, exact.hour)
        if session_date not in data:
            data[session_date] = 1
        else:
            data[session_date] += 1

data = dict(sorted(data.items()))

print(min(data.values()))

fig, ax = plt.subplots()
ax.plot(data.keys(), data.values())
ax.scatter(data.keys(), data.values())
ax.set_ylabel('Number of Logins')
ax.set_title('Summary of Demo Activity')

locator = mdates.AutoDateLocator(minticks=3, maxticks=7)
formatter = mdates.ConciseDateFormatter(locator)
ax.xaxis.set_major_locator(locator)
ax.xaxis.set_major_formatter(formatter)

for label in ax.get_xticklabels():
    label.set_rotation(40)
    label.set_horizontalalignment('right')

plt.show()