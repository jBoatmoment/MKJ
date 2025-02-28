Overall vulnerabilities:
-Direct querey acess to database (SQL Injection)
-Direct User inputs leading to cross-site scripting (XXS)
-Leakage of confidential information
-Lack of rate limiters (DDOS vunerable)

All sections:
+Added meta security in html files

about section:
+HTTPS redirection
+CSRF Protection
+Logger to replace print statements
+Uses SSL for local development security

admin section:
+Logger to replace print statements
+Added jsonify outputs for certain conditions

apps:

captcha:
+Added a random captcha generator

files:
+Limit upload to PDF and image files
+Ensure secure file deletion

home:
+Added escape

hub:
-Removed unnecessary imports

login:
+Added csrf_token
+Added secret_key
+Ensure password from database is hashed

news:
+Added a rate limiter (5 requests per minute)
+Replace print with logger
+Ensure input is limited for security
-Removed breach confidential news outlet

notes:
+Replaced prints with logger
+Change the SQL input for notes
+Hide maintanence message for admins only
-Removed "| safe"

register:
+Added CSRF token
+Ensure hashed password

401k/retirement:
+Added a valid input