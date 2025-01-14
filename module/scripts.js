function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('collapsed');
}

function navigateTo(section) {
    const content = document.getElementById('content');
    const templatePath = `module/templates/${section}.html`;

    fetch(templatePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${templatePath}`);
            }
            return response.text();
        })
        .then(html => {
            content.innerHTML = html;
        })
        .catch(() => {
            fetch('module/templates/notfound.html')
                .then(response => response.text())
                .then(html => {
                    content.innerHTML = html;
                });
        });
}

function loadBlogArticle(filename) {
    const content = document.getElementById('content');
    fetch(`/Blog/${filename}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}`);
            }
            return response.text();
        })
        .then(markdownContent => {
            const html = marked.parse(markdownContent); // 渲染 Markdown
            content.innerHTML = `
                <div class="markdown-content">
                    ${html}
                </div>`;
        })
        .catch(error => {
            content.innerHTML = `<p>Error loading article: ${error.message}</p>`;
        });
}

function showReadme() {
    const content = document.getElementById('content');
    fetch('README.md')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch README.md');
            }
            return response.text();
        })
        .then(readmeContent => {
            const html = marked.parse(readmeContent);
            content.innerHTML = `<div class="markdown-content">${html}</div>`;
        })
        .catch(error => {
            content.innerHTML = `<p>Error loading README.md: ${error.message}</p>`;
        });
}

function checkScreenWidth() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const footerText = document.querySelector('.footer-text');

    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('collapsed');
        footerText.style.width = '100%';
    } else {
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('collapsed');
        footerText.style.width = 'calc(100% + 250px)';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkScreenWidth();
    navigateTo('home');
});

window.addEventListener('resize', checkScreenWidth);
