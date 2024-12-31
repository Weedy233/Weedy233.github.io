function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('collapsed');
}

function navigateTo(section) {
    const content = document.getElementById('content');
    const templatePath = `module/templates/${section}.html`;

    // 动态加载模板文件
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
        .catch(error => {
            // 加载错误页
            fetch('module/templates/notfound.html')
                .then(response => response.text())
                .then(html => {
                    content.innerHTML = html;
                });
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
            content.innerHTML = `
                <div class="markdown-content">
                    ${html}
                </div>`;
        })
        .catch(error => {
            content.innerHTML = `<p>Error loading README.md: ${error.message}</p>`;
        });
}

document.addEventListener('DOMContentLoaded', () => {
    navigateTo('home');
});