<img src="img/logo_bcoe.png"><img src="img/slash.png"><img src="img/REDF_logo.png">
# BCOE / REDF Pre-Apprenticeship Curriculum
<hr>

## Project Overview
Create a trauma-informed pre-apprenticeship curriculum to prepare program participants to enter a Registered Apprenticeship Program (RAP) with a sponsoring employer. This curriculum includes two programs, Digital Literacy and Technical Skills. The Digital Literacy curriculum was designed to establish a foundation in using modern digital computing devices in a guided and approachable manor. The second program, Technical Skills builds on that foundation to provide students with the prerequisite skill set necessary to enter a Registered Apprenticeship Program in a technical computer support occupation. The instructional approach should prioritize best-practices in trauma-informed training. 

## Objectives
1. Develop study skills
2. Improve typing skills
2. Learn fundamental computer operations
3. Familiarize participants with common business applications
4. Enhance participant employability
5. Expand technical vocabulary and comprehension
6. Increase confidence in using technology
7. Develop IT troubleshooting skills
8. Create an awareness and appreciation of cybersecurity best practices
9. Understand IT helpdesk functions and operations
10. Establish a growth mindset with motivation for continuous learning

<hr>

## Project File Structure

    mkdocs.yml                                  # The configuration file
    docs/
        index.md                                # The project homepage
        digital_literacy.md                     # Digital Literacy Curriculum overview page
        format.md                               # Provides description of currciulum format
        lessons.md                              # Agends for digital literacy curriculum 
        technical.md                            # Home page for technical curriclum (TBD)
        img/                                    # Documentation image directory
        file/                                   # File directory for PDFs and other files
        file/DART_V1.0_Download                 # DART Curriculum original and edited files
        file/Technical_Skills_Files             # Presentations and other curriculum files 
        video/                                  # Video source files directory
        extra.css                               # Custom CSS style rules
        ...                                     # Other markdown pages, images and other files.
    712dc7592fd9f87b4446d410d04846dae744c676/   # Hashed directory name for login functionality
    site/                                       # `mkdocs build` application build target directory
    venv/                                       # virtual envvirontment, Python binaries

<hr>

## Repository Cloning

* `github repository location` - https://github.com/iaa-vthitec/redf.git
* `explore and download individual files`
* `Download ZIP ` - download entire project repository by clicking on the `Download ZIP` link from the `< > Code` button as shown in the following diagram: 

![github_download.png](img%2Fgithub_download.png)

Also see - https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository?tool=cli

## Project Files Development
* `github version control` - Recommended to track file changes via GitHub
* `recommended IDE` - PyCharm for Python development and local server deployment: https://www.jetbrains.com/pycharm/
* `mkdocs used for documentation building` - see documentation: https://www.mkdocs.org
* `mkdocs build` - Build the documentation site
* `mkdocs -h` - Print help message and exit
* `mkdocs serve` - Start the live-reloading docs server
* `mkdocs build` - Build the documentation site
* `mkdocs -h` - Print help message and exit

## Deployment via GitHub Pages
* `commit and push changes`
* copy contents of `site` directory into the `712dc7592fd9f87b4446d410d04846dae744c676` directory for access via (non-secure) login page
* `deploy using GitHub Pages` - Follow documentation to host curriculum site on GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
