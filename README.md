#web-historian

In this sprint, we rewrote part of http://archive.org, a web service that archives sites on the internet. It allows users to submit a URL, archive it (by getting a copy of that website off of the internet and writing it to a local text file) and show users a copy.

The application consists of two separate node applications:
- The first is a web service that serves pages over the web using a RESTful API
  - It can accept URLs of sites that the user wants to archive.
  - It uses POST requests to save submitted URLS to a single file on the computer.
- The second reads the list of URLs from that file and fetches the pages specified by those URLs from the internet, saving each web page into a file on the computer.
  - This second app is configured to run on a schedule using cron.

####Note
This is a project I completed as a student at [hackreactor](http://hackreactor.com). This project was worked on with a pair.
