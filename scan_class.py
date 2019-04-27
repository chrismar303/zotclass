import sys
import urllib.request
from bs4 import BeautifulSoup

# get class code [optional: add current quarter selection]
class_code = sys.argv[1]
# webpage
url = 'https://www.reg.uci.edu/perl/WebSoc?YearTerm=2019-14&CourseCodes={}'.format(class_code)

# extract html from url
with urllib.request.urlopen(url) as response:
    html_page = response.read()

# use beautiful soup to parse course data
soup = BeautifulSoup(html_page, 'html.parser')
course_div = soup.find('div', attrs={'class': 'course-list'})
course_row = course_div.table.find_all('tr')[4]
course_data = course_row.find_all('td')

# organize into course information
course_info = {
    'code': course_data[0].text,
    'instructor': course_data[4].text,
    'time': course_data[5].text,
    'location': course_data[6].text,
    'status': course_data[-1].text
}

print(course_info)
print("CLASS IS OPEN") if course_info['status'] == 'OPEN' else print('NOT OPEN')
