<?php
\$uri = \$_SERVER['REQUEST_URI'];

// Если API - Laravel
if (strpos(\$uri, '/api/') === 0) {
    require __DIR__.'/../vendor/autoload.php';
    \$app = require_once __DIR__.'/../bootstrap/app.php';
    \$app->make(Illuminate\Contracts\Http\Kernel::class)
        ->handle(Illuminate\Http\Request::capture());
} else {
    // Если файл существует - отдай его
    \$file = __DIR__ . \$uri;
    if (file_exists(\$file) && \$uri !== '/') {
        \$mime = mime_content_type(\$file) ?: 'text/plain';
        header('Content-Type: ' . \$mime);
        readfile(\$file);
    } else {
        // Иначе - React SPA
        readfile(__DIR__.'/index.html');
    }
}
"@ | Out-File -FilePath "index.php" -Encoding UTF8