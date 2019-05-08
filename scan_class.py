import sys
import urllib.request
import unicodedata
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
course_title = unicodedata.normalize("NFKD", soup.find('td', attrs={'class': 'CourseTitle'}).text)
course_title = " ".join([token for token in course_title.split() if "(" not in token]) # filter out '(co-courses) (prerequiste)'
course_div = soup.find('div', attrs={'class': 'course-list'}) # get parent tag containing course information
course_row = course_div.table.find_all('tr')[4]     # get row containing data
course_data = course_row.find_all('td')

# organize into course information
course_info = {
    'code': course_data[0].text,
    'title': course_title,
    'instructor': course_data[4].text,
    'time': unicodedata.normalize("NFKD", course_data[5].text),
    'location': course_data[6].text,
    'status': course_data[-1].text
}

print(course_info)
# print("CLASS IS OPEN") if course_info['status'] == 'OPEN' else print('NOT OPEN')
