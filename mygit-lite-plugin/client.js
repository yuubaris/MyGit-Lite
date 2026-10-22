window.__ModuleLoader__.load({
  id: '@local/mygit-lite',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'mygit-lite';

    const TEXT = {
      en: {
        'panel.title': 'MyGit Lite',
        'panel.subtitle': 'Browse repositories and publish snapshots',
        'common.refresh': 'Refresh',
        'common.cancel': 'Cancel',
        'common.close': 'Close',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.loading': 'Loading…',
        'common.retry': 'Retry',
        'common.search': 'Search',
        'common.none': 'None',
        'common.unknown': 'Unknown',
        'common.bytes': '{size} B',
        'setup.title': 'Connect to MyGit Lite',
        'setup.description': 'The token is stored by the Harness credential service and is never sent to the browser after it is saved.',
        'setup.baseUrlLabel': 'Server address',
        'setup.baseUrlHint': 'Your MyGit Lite server, e.g. https://git.example.com',
        'setup.invalidBaseUrl': 'Enter a valid server URL, like https://git.example.com.',
        'setup.tokenLabel': 'Bearer token',
        'setup.tokenHint': 'Usually read from /var/lib/mygit/token on the server.',
        'setup.connect': 'Connect',
        'setup.connecting': 'Checking connection…',
        'setup.security': 'Requests use your configured server and the b64s1 JSON framing described by the MyGit Lite protocol.',
        'setup.invalid': 'The server rejected this token. Check its value and try again.',
        'header.connected': 'Connected',
        'header.settings': 'Connection settings',
        'header.disconnect': 'Disconnect',
        'repos.title': 'Repositories',
        'repos.searchPlaceholder': 'Filter repositories',
        'repos.new': 'New repository',
        'repos.empty': 'No repositories yet',
        'repos.emptyHint': 'Create a repository to publish the first snapshot.',
        'repos.filteredEmpty': 'No repository matches this filter.',
        'repos.createTitle': 'New repository',
        'repos.slug': 'Slug',
        'repos.slugHint': 'Lowercase letters, digits, and hyphens.',
        'repos.name': 'Display name',
        'repos.description': 'Description',
        'repos.create': 'Create',
        'repos.creating': 'Creating…',
        'repos.deleteTitle': 'Delete repository',
        'repos.deleteBody': 'Delete “{name}” and all of its history? This cannot be undone.',
        'repos.deleteConfirm': 'Delete permanently',
        'repos.deleting': 'Deleting…',
        'repos.invalidSlug': 'Use 1–64 lowercase letters, digits, or hyphens; the slug cannot start or end with a hyphen.',
        'detail.defaultBranch': 'Default branch',
        'detail.head': 'Head',
        'detail.created': 'Created',
        'detail.path': 'Path',
        'detail.filesTab': 'Files',
        'detail.historyTab': 'History',
        'detail.branchesTab': 'Branches',
        'detail.tagsTab': 'Tags',
        'detail.upload': 'Upload snapshot',
        'detail.delete': 'Delete repository',
        'detail.emptyTitle': 'Select a repository',
        'detail.emptyHint': 'Choose a repository on the left to browse files, commits, branches, and tags.',
        'detail.noFiles': 'This directory is empty.',
        'detail.noCommits': 'No commits on this branch yet.',
        'detail.noBranches': 'No branches.',
        'detail.noTags': 'No tags yet.',
        'upload.title': 'Upload a commit',
        'upload.file': 'Zip file',
        'upload.message': 'Commit message',
        'upload.messagePlaceholder': 'What changed?',
        'upload.branch': 'Branch',
        'upload.mode': 'Mode',
        'upload.snapshot': 'Snapshot — replace the tree with this zip',
        'upload.patch': 'Patch — apply only these files',
        'upload.deletions': 'Deleted paths (JSON array)',
        'upload.deletionsHint': 'Used only in patch mode, for example ["dist", "old.txt"].',
        'upload.submit': 'Publish commit',
        'upload.uploading': 'Uploading…',
        'upload.requireFile': 'Choose a .zip file first.',
        'upload.requireMessage': 'A commit message is required.',
        'upload.success': 'Commit {hash} published.',
        'upload.forbiddenSnapshot': 'Snapshot mode needs a complete workspace zip. Use patch mode for partial uploads.',
        'file.binary': 'Binary file — preview is not available.',
        'file.truncated': 'Preview truncated at 512 KB.',
        'file.close': 'Close preview',
        'file.loading': 'Reading file…',
        'table.hash': 'Commit',
        'table.message': 'Message',
        'table.author': 'Author',
        'table.date': 'Date',
        'table.name': 'Name',
        'table.commit': 'Commit',
        'table.updated': 'Updated',
        'table.default': 'default',
        'table.size': 'Size',
        'notice.authExpired': 'The saved token is no longer accepted. Open connection settings to replace it.',
        'notice.loadFailed': 'Could not load data from MyGit Lite.',
        'notice.created': 'Repository “{slug}” created.',
        'notice.deleted': 'Repository deleted.',
        'notice.tokenSaved': 'Connection verified and saved.',
        'notice.tokenCleared': 'Token removed from this Harness.',
        'notice.refreshed': 'Repository list refreshed.',
        'composer.upload': 'Upload workspace',
        'workspace.title': 'Upload current workspace',
        'workspace.description': 'The Harness packages this workspace on the Host, excluding .git and symbolic links automatically.',
        'workspace.select': 'Workspace',
        'workspace.repo': 'Repository',
        'workspace.newRepo': 'New repository…',
        'workspace.slug': 'New repository slug',
        'workspace.name': 'New repository name',
        'workspace.branch': 'Branch',
        'workspace.message': 'Commit message',
        'workspace.messagePlaceholder': 'Describe this workspace snapshot',
        'workspace.mode': 'Mode',
        'workspace.note': 'snapshot replaces the remote tree with this workspace; patch only adds or updates files and leaves other remote files alone.',
        'workspace.submit': 'Package and upload',
        'workspace.uploading': 'Scanning and packaging the workspace…',
        'workspace.cancel': 'Cancel upload',
        'workspace.cancelled': 'Upload cancelled.',
        'workspace.success': 'Workspace uploaded.',
        'workspace.commit': 'Commit',
        'workspace.files': 'Files',
        'workspace.size': 'Original size',
        'workspace.zipSize': 'Zip size',
        'workspace.skipped': 'Skipped paths',
        'workspace.none': 'No workspace is available. Open a workspace in Harness first.',
        'workspace.unconfigured': 'MyGit Lite is not connected yet.',
        'workspace.openSettings': 'Open MyGit Lite settings',
        'workspace.needMessage': 'A commit message is required.',
        'workspace.needRepo': 'Choose or create a target repository.',
        'workspace.invalidSlug': 'Use 1–64 lowercase letters, digits, or hyphens; the slug cannot start or end with a hyphen.',
        'workspace.done': 'Done',
        'workspace.close': 'Close',
        'error.generic': 'Something went wrong.',
        'error.offline': 'The MyGit Lite service is unreachable.',
        'error.notFound': 'The requested item no longer exists.',
      },
      zh: {
        'panel.title': 'MyGit Lite',
        'panel.subtitle': '浏览仓库并发布快照',
        'common.refresh': '刷新',
        'common.cancel': '取消',
        'common.close': '关闭',
        'common.save': '保存',
        'common.delete': '删除',
        'common.loading': '加载中…',
        'common.retry': '重试',
        'common.search': '搜索',
        'common.none': '无',
        'common.unknown': '未知',
        'common.bytes': '{size} B',
        'setup.title': '连接 MyGit Lite',
        'setup.description': '令牌保存在 Harness 凭据服务中，保存后不会再发送到浏览器。',
        'setup.baseUrlLabel': '服务地址',
        'setup.baseUrlHint': '你的 MyGit Lite 服务地址，例如 https://git.example.com',
        'setup.invalidBaseUrl': '请输入有效的服务地址，例如 https://git.example.com。',
        'setup.tokenLabel': 'Bearer 令牌',
        'setup.tokenHint': '通常读取自服务端 /var/lib/mygit/token。',
        'setup.connect': '连接',
        'setup.connecting': '正在校验连接…',
        'setup.security': '请求使用你配置的服务地址和协议规定的 b64s1 JSON 编码。',
        'setup.invalid': '服务端拒绝了该令牌，请检查后重试。',
        'header.connected': '已连接',
        'header.settings': '连接设置',
        'header.disconnect': '断开连接',
        'repos.title': '仓库',
        'repos.searchPlaceholder': '筛选仓库',
        'repos.new': '新建仓库',
        'repos.empty': '还没有仓库',
        'repos.emptyHint': '创建一个仓库，发布第一个快照。',
        'repos.filteredEmpty': '没有匹配的仓库。',
        'repos.createTitle': '新建仓库',
        'repos.slug': '标识（slug）',
        'repos.slugHint': '仅小写字母、数字和连字符。',
        'repos.name': '显示名称',
        'repos.description': '描述',
        'repos.create': '创建',
        'repos.creating': '创建中…',
        'repos.deleteTitle': '删除仓库',
        'repos.deleteBody': '确定删除“{name}”及其全部历史吗？此操作不可恢复。',
        'repos.deleteConfirm': '永久删除',
        'repos.deleting': '删除中…',
        'repos.invalidSlug': '请使用 1–64 位小写字母、数字或连字符，且不能以连字符开头或结尾。',
        'detail.defaultBranch': '默认分支',
        'detail.head': 'Head',
        'detail.created': '创建时间',
        'detail.path': '路径',
        'detail.filesTab': '文件',
        'detail.historyTab': '历史',
        'detail.branchesTab': '分支',
        'detail.tagsTab': '标签',
        'detail.upload': '上传快照',
        'detail.delete': '删除仓库',
        'detail.emptyTitle': '选择一个仓库',
        'detail.emptyHint': '从左侧选择仓库，浏览文件、提交、分支和标签。',
        'detail.noFiles': '此目录为空。',
        'detail.noCommits': '该分支还没有提交。',
        'detail.noBranches': '没有分支。',
        'detail.noTags': '还没有标签。',
        'upload.title': '上传提交',
        'upload.file': 'Zip 文件',
        'upload.message': '提交说明',
        'upload.messagePlaceholder': '本次改了什么？',
        'upload.branch': '分支',
        'upload.mode': '模式',
        'upload.snapshot': 'snapshot — 用此 zip 替换整棵树',
        'upload.patch': 'patch — 只应用 zip 中的文件',
        'upload.deletions': '删除路径（JSON 数组）',
        'upload.deletionsHint': '仅 patch 模式使用，例如 ["dist", "old.txt"]。',
        'upload.submit': '发布提交',
        'upload.uploading': '上传中…',
        'upload.requireFile': '请先选择 .zip 文件。',
        'upload.requireMessage': '提交说明不能为空。',
        'upload.success': '提交 {hash} 已发布。',
        'upload.forbiddenSnapshot': 'snapshot 模式需要完整工作区 zip；部分上传请使用 patch 模式。',
        'file.binary': '二进制文件，无法预览。',
        'file.truncated': '预览已截断到 512 KB。',
        'file.close': '关闭预览',
        'file.loading': '正在读取文件…',
        'table.hash': '提交',
        'table.message': '说明',
        'table.author': '作者',
        'table.date': '时间',
        'table.name': '名称',
        'table.commit': '提交',
        'table.updated': '更新时间',
        'table.default': '默认',
        'table.size': '大小',
        'notice.authExpired': '已保存的令牌不再被接受，请打开连接设置更换令牌。',
        'notice.loadFailed': '无法从 MyGit Lite 加载数据。',
        'notice.created': '仓库“{slug}”已创建。',
        'notice.deleted': '仓库已删除。',
        'notice.tokenSaved': '连接校验通过并已保存。',
        'notice.tokenCleared': '已从 Harness 移除令牌。',
        'notice.refreshed': '仓库列表已刷新。',
        'composer.upload': '上传工作区',
        'workspace.title': '上传当前工作区',
        'workspace.description': 'Harness 会在 Host 侧打包该工作区，自动排除 .git 和符号链接。',
        'workspace.select': '工作区',
        'workspace.repo': '目标仓库',
        'workspace.newRepo': '新建仓库…',
        'workspace.slug': '新仓库标识（slug）',
        'workspace.name': '新仓库显示名称',
        'workspace.branch': '分支',
        'workspace.message': '提交说明',
        'workspace.messagePlaceholder': '描述这次工作区快照',
        'workspace.mode': '模式',
        'workspace.note': 'snapshot 会用当前工作区替换远端整棵树；patch 只新增或更新文件，不删除远端其他文件。',
        'workspace.submit': '打包并上传',
        'workspace.uploading': '正在扫描并打包工作区…',
        'workspace.cancel': '取消上传',
        'workspace.cancelled': '上传已取消。',
        'workspace.success': '工作区已上传。',
        'workspace.commit': '提交',
        'workspace.files': '文件数',
        'workspace.size': '原始大小',
        'workspace.zipSize': 'Zip 大小',
        'workspace.skipped': '已跳过路径',
        'workspace.none': '没有可用的工作区，请先在 Harness 中打开一个工作区。',
        'workspace.unconfigured': '尚未连接 MyGit Lite。',
        'workspace.openSettings': '打开 MyGit Lite 设置',
        'workspace.needMessage': '请填写提交说明。',
        'workspace.needRepo': '请选择或创建一个目标仓库。',
        'workspace.invalidSlug': '请使用 1–64 位小写字母、数字或连字符，且不能以连字符开头或结尾。',
        'workspace.done': '完成',
        'workspace.close': '关闭',
        'error.generic': '操作失败。',
        'error.offline': '无法连接 MyGit Lite 服务。',
        'error.notFound': '请求的内容不存在。',
      },
    };

    function shortHash(value) {
      return value ? String(value).slice(0, 8) : '—';
    }

    function formatDate(value) {
      if (!value) return '—';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return date.toLocaleString();
    }

    function formatBytes(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
      if (value < 1024) return `${value} B`;
      if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
      return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    }

    function cx(...values) {
      return values.filter(Boolean).join(' ');
    }

    async function api(path, options = {}) {
      const init = { method: options.method || 'GET', headers: {} };
      if (options.signal) init.signal = options.signal;
      if (options.body !== undefined) {
        init.headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(options.body);
      }
      const response = await fetch(`/mygit-lite/api${path}`, init);
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok) {
        const error = new Error(data && typeof data.error === 'string' ? data.error : `HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return data;
    }

    function messageFor(error, t) {
      if (error && error.status === 401) return t('notice.authExpired');
      if (error && error.status === 404) return t('error.notFound');
      if (error && error.status === 502) return t('error.offline');
      return error && error.message ? error.message : t('error.generic');
    }

    const uploadStore = (() => {
      let state = { open: false, sessionId: null };
      const listeners = new Set();
      return {
        get() { return state; },
        set(next) {
          state = { ...state, ...next };
          for (const listener of listeners) listener(state);
        },
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      };
    })();

    const changeListeners = new Set();

    function notifyMyGitChanged() {
      for (const listener of changeListeners) listener();
    }

    function subscribeMyGitChanged(listener) {
      changeListeners.add(listener);
      return () => changeListeners.delete(listener);
    }

    function useUploadStore() {
      const [state, setState] = React.useState(uploadStore.get());
      React.useEffect(() => uploadStore.subscribe(setState), []);
      return state;
    }

    function openWorkspaceUpload(sessionId) {
      uploadStore.set({ open: true, sessionId: sessionId || null });
    }

    function closeWorkspaceUpload() {
      uploadStore.set({ open: false });
    }

    function BranchIcon({ size = 18 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('circle', { cx: 6, cy: 5, r: 2.2 }),
        h('circle', { cx: 6, cy: 19, r: 2.2 }),
        h('circle', { cx: 18, cy: 8, r: 2.2 }),
        h('path', { d: 'M6 7.2v9.6M8.2 8h5.6a2 2 0 0 1 2 2v.2M18 10.2V14a3 3 0 0 1-3 3H8.2' }),
      );
    }

    function FolderIcon({ size = 16 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('path', { d: 'M3.5 7.5h6l2 2h9v9.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z' }),
        h('path', { d: 'M3.5 7.5V5.8A1.3 1.3 0 0 1 4.8 4.5H8l2 2' }),
      );
    }

    function FileIcon({ size = 16 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('path', { d: 'M6 3.5h7l5 5v12H6z' }),
        h('path', { d: 'M13 3.5v5h5M9 12h6M9 15.5h6' }),
      );
    }

    function PlusIcon({ size = 15 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', 'aria-hidden': true,
      }, h('path', { d: 'M12 5v14M5 12h14' }));
    }

    function RefreshIcon({ size = 15 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('path', { d: 'M20 11a8 8 0 1 0-2.3 5.7' }),
        h('path', { d: 'M20 4v7h-7' }),
      );
    }

    function SearchIcon({ size = 15 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', 'aria-hidden': true,
      },
        h('circle', { cx: 10.5, cy: 10.5, r: 6.5 }),
        h('path', { d: 'm15.5 15.5 4.5 4.5' }),
      );
    }

    function UploadIcon({ size = 15 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('path', { d: 'M12 16V4M7.5 8.5 12 4l4.5 4.5' }),
        h('path', { d: 'M4 15.5v3A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-3' }),
      );
    }

    function TrashIcon({ size = 15 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('path', { d: 'M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13' }),
        h('path', { d: 'M10 11v5M14 11v5' }),
      );
    }

    function CloseIcon({ size = 15 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', 'aria-hidden': true,
      }, h('path', { d: 'm6 6 12 12M18 6 6 18' }));
    }

    function ChevronIcon({ size = 15 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true,
      }, h('path', { d: 'm9 5 7 7-7 7' }));
    }

    function Button({ children, variant = 'default', className, type = 'button', ...rest }) {
      return h('button', {
        ...rest,
        type,
        className: cx('mygit-btn', variant === 'primary' && 'is-primary', variant === 'danger' && 'is-danger', className),
      }, children);
    }

    function IconButton({ label, children, ...rest }) {
      return h('button', { ...rest, type: 'button', className: 'mygit-icon-btn', 'aria-label': label, title: label }, children);
    }

    function Modal({ title, closeLabel = 'Close', onClose, children }) {
      React.useEffect(() => {
        const onKey = (event) => {
          if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [onClose]);
      return h('div', {
        className: 'mygit-modal-backdrop',
        onMouseDown(event) {
          if (event.target === event.currentTarget) onClose();
        },
      }, h('div', { className: 'mygit-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
        h('div', { className: 'mygit-modal-head' },
          h('h2', null, title),
          h(IconButton, { label: closeLabel, onClick: onClose }, h(CloseIcon)),
        ),
        children,
      ));
    }

    function Empty({ title, hint }) {
      return h('div', { className: 'mygit-empty' },
        h('div', { className: 'mygit-empty-mark' }, h(BranchIcon, { size: 26 })),
        h('h3', null, title),
        hint ? h('p', null, hint) : null,
      );
    }

    function TokenForm({ connection, baseUrl, setBaseUrl, token, setToken, busy, error, submitLabel, onSubmit, t, onDisconnect }) {
      return h('form', {
        className: 'mygit-token-form',
        onSubmit(event) {
          event.preventDefault();
          onSubmit();
        },
      },
        h('p', { className: 'mygit-muted' }, t('setup.description')),
        h('label', { className: 'mygit-field' },
          h('span', null, t('setup.baseUrlLabel')),
          h('input', {
            type: 'text',
            value: baseUrl,
            autoFocus: true,
            autoComplete: 'off',
            spellCheck: false,
            inputMode: 'url',
            placeholder: 'https://git.example.com',
            onChange: (event) => setBaseUrl(event.target.value),
          }),
          h('small', null, t('setup.baseUrlHint')),
        ),
        h('label', { className: 'mygit-field' },
          h('span', null, t('setup.tokenLabel')),
          h('input', {
            type: 'password',
            value: token,
            autoComplete: 'off',
            spellCheck: false,
            placeholder: '••••••••',
            onChange: (event) => setToken(event.target.value),
          }),
          h('small', null, t('setup.tokenHint')),
        ),
        error ? h('div', { className: 'mygit-error' }, error) : null,
        h('p', { className: 'mygit-security' }, t('setup.security')),
        h('div', { className: 'mygit-form-actions' },
          onDisconnect && connection.configured
            ? h(Button, { variant: 'danger', onClick: onDisconnect }, t('header.disconnect'))
            : null,
          h(Button, { variant: 'primary', type: 'submit', disabled: busy || !token.trim() || !baseUrl.trim() },
            busy ? t('setup.connecting') : (submitLabel || t('setup.connect'))),
        ),
      );
    }

    function Setup({ connection, baseUrl, setBaseUrl, token, setToken, busy, error, onSubmit, t }) {
      return h('div', { className: 'mygit-setup' },
        h('div', { className: 'mygit-setup-card' },
          h('div', { className: 'mygit-setup-mark' }, h(BranchIcon, { size: 30 })),
          h('h1', null, t('setup.title')),
          h(TokenForm, {
            connection, baseUrl, setBaseUrl, token, setToken, busy, error, onSubmit, t,
          }),
        ),
      );
    }

    function CreateRepoForm({ values, setValues, busy, error, onSubmit, onCancel, t }) {
      return h('form', {
        className: 'mygit-create',
        onSubmit(event) {
          event.preventDefault();
          onSubmit();
        },
      },
        h('div', { className: 'mygit-create-title' }, t('repos.createTitle')),
        h('label', { className: 'mygit-field compact' },
          h('span', null, t('repos.slug')),
          h('input', {
            value: values.slug,
            autoFocus: true,
            spellCheck: false,
            placeholder: 'my-project',
            onChange: (event) => setValues({ ...values, slug: event.target.value }),
          }),
          h('small', null, t('repos.slugHint')),
        ),
        h('label', { className: 'mygit-field compact' },
          h('span', null, t('repos.name')),
          h('input', {
            value: values.name,
            placeholder: values.slug || t('repos.name'),
            onChange: (event) => setValues({ ...values, name: event.target.value }),
          }),
        ),
        h('label', { className: 'mygit-field compact' },
          h('span', null, t('repos.description')),
          h('textarea', {
            value: values.description,
            rows: 2,
            onChange: (event) => setValues({ ...values, description: event.target.value }),
          }),
        ),
        error ? h('div', { className: 'mygit-error small' }, error) : null,
        h('div', { className: 'mygit-form-actions' },
          h(Button, { onClick: onCancel }, t('common.cancel')),
          h(Button, { variant: 'primary', type: 'submit', disabled: busy },
            busy ? t('repos.creating') : t('repos.create')),
        ),
      );
    }

    function UploadForm({ repo, values, setValues, file, setFile, busy, error, onSubmit, onCancel, t }) {
      return h('form', {
        className: 'mygit-upload',
        onSubmit(event) {
          event.preventDefault();
          onSubmit();
        },
      },
        h('div', { className: 'mygit-upload-head' },
          h('div', null,
            h('h3', null, t('upload.title')),
            h('p', { className: 'mygit-muted' }, t('upload.forbiddenSnapshot')),
          ),
          h(IconButton, { label: t('common.close'), onClick: onCancel }, h(CloseIcon)),
        ),
        h('div', { className: 'mygit-upload-grid' },
          h('label', { className: 'mygit-field' },
            h('span', null, t('upload.file')),
            h('input', {
              type: 'file',
              accept: '.zip,application/zip',
              onChange: (event) => setFile(event.target.files && event.target.files[0] ? event.target.files[0] : null),
            }),
          ),
          h('label', { className: 'mygit-field' },
            h('span', null, t('upload.branch')),
            h('input', {
              value: values.branch,
              placeholder: repo.default_branch || 'main',
              onChange: (event) => setValues({ ...values, branch: event.target.value }),
            }),
          ),
          h('label', { className: 'mygit-field' },
            h('span', null, t('upload.mode')),
            h('select', {
              value: values.mode,
              onChange: (event) => setValues({ ...values, mode: event.target.value }),
            },
              h('option', { value: 'snapshot' }, t('upload.snapshot')),
              h('option', { value: 'patch' }, t('upload.patch')),
            ),
          ),
          h('label', { className: 'mygit-field' },
            h('span', null, t('upload.message')),
            h('input', {
              value: values.message,
              placeholder: t('upload.messagePlaceholder'),
              onChange: (event) => setValues({ ...values, message: event.target.value }),
            }),
          ),
          values.mode === 'patch' ? h('label', { className: 'mygit-field wide' },
            h('span', null, t('upload.deletions')),
            h('input', {
              value: values.deletions,
              placeholder: '["dist", "old.txt"]',
              onChange: (event) => setValues({ ...values, deletions: event.target.value }),
            }),
            h('small', null, t('upload.deletionsHint')),
          ) : null,
        ),
        error ? h('div', { className: 'mygit-error' }, error) : null,
        h('div', { className: 'mygit-form-actions' },
          h(Button, { onClick: onCancel }, t('common.cancel')),
          h(Button, { variant: 'primary', type: 'submit', disabled: busy },
            busy ? t('upload.uploading') : t('upload.submit')),
        ),
      );
    }

    function WorkspaceUploadButton({ ctx, sessionId }) {
      const t = ctx.locale.bind(NS);
      return h('button', {
        type: 'button',
        className: 'mygit-composer-btn',
        title: t('composer.upload'),
        'aria-label': t('composer.upload'),
        onClick: () => openWorkspaceUpload(sessionId),
      },
        h(UploadIcon, { size: 14 }),
        h('span', null, t('composer.upload')),
      );
    }

    function WorkspaceUploadOverlay({ ctx }) {
      const modal = useUploadStore();
      const [, force] = React.useReducer((value) => value + 1, 0);
      React.useEffect(() => ctx.locale.subscribe(force), [ctx]);
      const t = ctx.locale.bind(NS);

      const [phase, setPhase] = React.useState('idle');
      const [workspaces, setWorkspaces] = React.useState([]);
      const [repos, setRepos] = React.useState([]);
      const [form, setForm] = React.useState({
        workspaceId: '', repoSlug: '', branch: 'main', message: '', mode: 'snapshot', newSlug: '', newName: '',
      });
      const [newRepo, setNewRepo] = React.useState(false);
      const [error, setError] = React.useState('');
      const [result, setResult] = React.useState(null);
      const abortRef = React.useRef(null);

      const update = (patch) => setForm((current) => ({ ...current, ...patch }));

      React.useEffect(() => {
        if (!modal.open) return undefined;
        const controller = new AbortController();
        abortRef.current = controller;
        setPhase('loading');
        setError('');
        setResult(null);
        (async () => {
          try {
            const state = await api('/state', { signal: controller.signal });
            if (controller.signal.aborted) return;
            if (!state.configured) {
              setPhase('unconfigured');
              return;
            }
            const query = modal.sessionId ? `?sessionId=${encodeURIComponent(modal.sessionId)}` : '';
            const [workspaceData, repoData] = await Promise.all([
              api(`/workspaces${query}`, { signal: controller.signal }),
              api('/repos', { signal: controller.signal }),
            ]);
            if (controller.signal.aborted) return;
            const list = Array.isArray(workspaceData.workspaces) ? workspaceData.workspaces : [];
            const repoList = Array.isArray(repoData.repos) ? repoData.repos : [];
            const current = list.find((workspace) => workspace.current && !workspace.missing)
              || list.find((workspace) => !workspace.missing)
              || list[0]
              || null;
            let lastRepo = null;
            try {
              lastRepo = window.localStorage.getItem('mygit-lite:last-repo');
            } catch {
              lastRepo = null;
            }
            const repo = repoList.find((candidate) => candidate.slug === lastRepo) || repoList[0] || null;
            setWorkspaces(list);
            setRepos(repoList);
            setNewRepo(repoList.length === 0);
            setForm({
              workspaceId: current ? current.id : '',
              repoSlug: repo ? repo.slug : '__new__',
              branch: repo ? repo.default_branch || 'main' : 'main',
              message: '',
              mode: 'snapshot',
              newSlug: '',
              newName: '',
            });
            setPhase('ready');
          } catch (failure) {
            if (controller.signal.aborted) return;
            setError(messageFor(failure, t));
            setPhase('error');
          }
        })();
        return () => controller.abort();
      }, [modal.open, modal.sessionId, t]);

      React.useEffect(() => {
        if (!modal.open) return undefined;
        const onKey = (event) => {
          if (event.key !== 'Escape') return;
          if (abortRef.current) abortRef.current.abort();
          closeWorkspaceUpload();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [modal.open]);

      const close = () => {
        if (abortRef.current) abortRef.current.abort();
        closeWorkspaceUpload();
      };

      const chooseRepo = (slug) => {
        if (slug === '__new__') {
          setNewRepo(true);
          update({ repoSlug: '__new__' });
          return;
        }
        const repo = repos.find((candidate) => candidate.slug === slug);
        setNewRepo(false);
        update({ repoSlug: slug, branch: repo ? repo.default_branch || 'main' : form.branch });
        try {
          window.localStorage.setItem('mygit-lite:last-repo', slug);
        } catch {
          // Local preference is optional.
        }
      };

      const submit = async () => {
        if (!form.workspaceId) {
          setError(t('workspace.none'));
          return;
        }
        if (!form.message.trim()) {
          setError(t('workspace.needMessage'));
          return;
        }
        if (newRepo && !/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(form.newSlug.trim())) {
          setError(t('workspace.invalidSlug'));
          return;
        }
        if (!newRepo && !form.repoSlug) {
          setError(t('workspace.needRepo'));
          return;
        }

        const controller = new AbortController();
        abortRef.current = controller;
        setPhase('uploading');
        setError('');
        try {
          let slug = form.repoSlug;
          if (newRepo) {
            const created = await api('/repos', {
              method: 'POST',
              body: {
                slug: form.newSlug.trim(),
                ...(form.newName.trim() ? { name: form.newName.trim() } : {}),
              },
              signal: controller.signal,
            });
            slug = created.slug;
            try {
              window.localStorage.setItem('mygit-lite:last-repo', slug);
            } catch {
              // Local preference is optional.
            }
            notifyMyGitChanged();
          }
          const payload = await api(`/repos/${encodeURIComponent(slug)}/commits/workspace`, {
            method: 'POST',
            body: {
              workspaceId: form.workspaceId,
              message: form.message.trim(),
              branch: form.branch.trim() || 'main',
              mode: form.mode,
            },
            signal: controller.signal,
          });
          setResult({ ...payload, slug });
          setPhase('success');
          notifyMyGitChanged();
        } catch (failure) {
          if (controller.signal.aborted) {
            setPhase('ready');
            setError(t('workspace.cancelled'));
          } else {
            setPhase('ready');
            setError(messageFor(failure, t));
          }
        }
      };

      const openSettings = () => {
        closeWorkspaceUpload();
        ctx.layout.selectPanel('mygit-lite');
      };

      const currentWorkspace = workspaces.find((workspace) => workspace.id === form.workspaceId);
      const busy = phase === 'uploading';
      const canSubmit = phase === 'ready' && Boolean(form.workspaceId) && !busy;

      return h(React.Fragment, null,
        h('style', null, CSS),
        !modal.open ? null : h('div', {
        className: 'mygit-workspace-backdrop',
        onMouseDown(event) {
          if (event.target === event.currentTarget && !busy) close();
        },
      }, h('div', {
        className: 'mygit-workspace-dialog',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': t('workspace.title'),
        'aria-busy': busy,
      },
        h('div', { className: 'mygit-workspace-head' },
          h('div', { className: 'mygit-workspace-heading' },
            h('div', { className: 'mygit-workspace-mark' }, h(UploadIcon, { size: 18 })),
            h('div', null,
              h('h2', null, t('workspace.title')),
              h('p', null, t('workspace.description')),
            ),
          ),
          h(IconButton, { label: t('workspace.close'), onClick: close }, h(CloseIcon)),
        ),
        phase === 'loading' ? h('div', { className: 'mygit-workspace-loading' },
          h('div', { className: 'mygit-spinner' }),
          h('span', null, t('common.loading')),
        ) : null,
        phase === 'unconfigured' ? h('div', { className: 'mygit-workspace-message' },
          h('p', null, t('workspace.unconfigured')),
          h('div', { className: 'mygit-form-actions' },
            h(Button, { onClick: close }, t('common.cancel')),
            h(Button, { variant: 'primary', onClick: openSettings }, t('workspace.openSettings')),
          ),
        ) : null,
        phase === 'error' ? h('div', { className: 'mygit-workspace-message' },
          h('div', { className: 'mygit-error' }, error),
          h('div', { className: 'mygit-form-actions' },
            h(Button, { onClick: close }, t('common.close')),
          ),
        ) : null,
        phase === 'success' ? h('div', { className: 'mygit-workspace-success' },
          h('div', { className: 'mygit-workspace-success-mark' }, h(UploadIcon, { size: 22 })),
          h('h3', null, t('workspace.success')),
          h('p', { className: 'mygit-muted' }, result && result.workspace ? (result.workspace.title || '') : ''),
          h('div', { className: 'mygit-workspace-stats' },
            h('div', null, h('span', null, t('workspace.commit')), h('code', null, result ? shortHash(result.commit) : '—')),
            h('div', null, h('span', null, t('workspace.files')), h('strong', null, result && result.workspace ? String(result.workspace.files) : '—')),
            h('div', null, h('span', null, t('workspace.size')), h('strong', null, result && result.workspace ? formatBytes(result.workspace.bytes) : '—')),
            h('div', null, h('span', null, t('workspace.zipSize')), h('strong', null, result && result.workspace ? formatBytes(result.workspace.zipBytes) : '—')),
          ),
          result && result.workspace && result.workspace.skippedCount
            ? h('p', { className: 'mygit-muted' }, `${t('workspace.skipped')}: ${result.workspace.skippedCount}`)
            : null,
          h('div', { className: 'mygit-form-actions' },
            h(Button, { variant: 'primary', onClick: close }, t('workspace.done')),
          ),
        ) : null,
        (phase === 'ready' || phase === 'uploading') ? h('div', { className: 'mygit-workspace-form' },
          h('div', { className: 'mygit-workspace-grid' },
            h('label', { className: 'mygit-field wide' },
              h('span', null, t('workspace.select')),
              h('select', {
                value: form.workspaceId,
                disabled: busy || workspaces.length === 0,
                onChange: (event) => update({ workspaceId: event.target.value }),
              },
                workspaces.length === 0 ? h('option', { value: '' }, t('workspace.none')) : null,
                workspaces.map((workspace) => h('option', {
                  key: workspace.id,
                  value: workspace.id,
                  disabled: workspace.missing,
                }, `${workspace.title || workspace.id} — ${workspace.missing ? '⚠ ' : ''}${workspace.path}`)),
              ),
              currentWorkspace ? h('small', { className: 'mygit-workspace-path' }, currentWorkspace.path) : null,
            ),
            h('label', { className: 'mygit-field' },
              h('span', null, t('workspace.repo')),
              h('select', {
                value: newRepo ? '__new__' : form.repoSlug,
                disabled: busy,
                onChange: (event) => chooseRepo(event.target.value),
              },
                repos.map((repo) => h('option', { key: repo.slug, value: repo.slug }, `${repo.name || repo.slug} (${repo.slug})`)),
                h('option', { value: '__new__' }, t('workspace.newRepo')),
              ),
            ),
            h('label', { className: 'mygit-field' },
              h('span', null, t('workspace.branch')),
              h('input', {
                value: form.branch,
                disabled: busy,
                onChange: (event) => update({ branch: event.target.value }),
              }),
            ),
            newRepo ? h('label', { className: 'mygit-field' },
              h('span', null, t('workspace.slug')),
              h('input', {
                value: form.newSlug,
                disabled: busy,
                placeholder: 'my-project',
                onChange: (event) => update({ newSlug: event.target.value }),
              }),
            ) : null,
            newRepo ? h('label', { className: 'mygit-field' },
              h('span', null, t('workspace.name')),
              h('input', {
                value: form.newName,
                disabled: busy,
                placeholder: t('workspace.name'),
                onChange: (event) => update({ newName: event.target.value }),
              }),
            ) : null,
            h('label', { className: 'mygit-field' },
              h('span', null, t('workspace.mode')),
              h('select', {
                value: form.mode,
                disabled: busy,
                onChange: (event) => update({ mode: event.target.value }),
              },
                h('option', { value: 'snapshot' }, 'snapshot'),
                h('option', { value: 'patch' }, 'patch'),
              ),
            ),
            h('label', { className: 'mygit-field wide' },
              h('span', null, t('workspace.message')),
              h('textarea', {
                value: form.message,
                disabled: busy,
                rows: 3,
                autoFocus: true,
                placeholder: t('workspace.messagePlaceholder'),
                onChange: (event) => update({ message: event.target.value }),
              }),
            ),
          ),
          h('p', { className: 'mygit-workspace-note' }, t('workspace.note')),
          error ? h('div', { className: 'mygit-error' }, error) : null,
          busy ? h('div', { className: 'mygit-workspace-progress' },
            h('div', { className: 'mygit-spinner small' }),
            h('span', null, t('workspace.uploading')),
          ) : null,
          h('div', { className: 'mygit-form-actions' },
            h(Button, { onClick: close, disabled: false }, busy ? t('workspace.cancel') : t('common.cancel')),
            h(Button, { variant: 'primary', onClick: submit, disabled: !canSubmit }, t('workspace.submit')),
          ),
        ) : null,
      )));
    }

    function Panel({ ctx }) {
      const [, force] = React.useReducer((value) => value + 1, 0);
      React.useEffect(() => ctx.locale.subscribe(force), [ctx]);
      const t = ctx.locale.bind(NS);

      const [connection, setConnection] = React.useState({ loading: true, configured: false, baseUrl: '' });
      const [authOpen, setAuthOpen] = React.useState(false);
      const [baseUrlDraft, setBaseUrlDraft] = React.useState('');
      const [tokenDraft, setTokenDraft] = React.useState('');
      const [authBusy, setAuthBusy] = React.useState(false);
      const [authError, setAuthError] = React.useState('');

      const [repos, setRepos] = React.useState([]);
      const [reposLoading, setReposLoading] = React.useState(false);
      const [reposError, setReposError] = React.useState('');
      const [filter, setFilter] = React.useState('');
      const [selectedSlug, setSelectedSlug] = React.useState(null);

      const [createOpen, setCreateOpen] = React.useState(false);
      const [createValues, setCreateValues] = React.useState({ slug: '', name: '', description: '' });
      const [createBusy, setCreateBusy] = React.useState(false);
      const [createError, setCreateError] = React.useState('');

      const [detail, setDetail] = React.useState(null);
      const [detailLoading, setDetailLoading] = React.useState(false);
      const [detailError, setDetailError] = React.useState('');
      const [tab, setTab] = React.useState('files');
      const [treePath, setTreePath] = React.useState('');
      const [refreshTick, setRefreshTick] = React.useState(0);

      const [filePreview, setFilePreview] = React.useState(null);
      const [fileBusy, setFileBusy] = React.useState(false);
      const [fileError, setFileError] = React.useState('');

      const [deleteOpen, setDeleteOpen] = React.useState(false);
      const [deleteBusy, setDeleteBusy] = React.useState(false);

      const [uploadOpen, setUploadOpen] = React.useState(false);
      const [uploadValues, setUploadValues] = React.useState({ message: '', branch: '', mode: 'snapshot', deletions: '' });
      const [uploadFile, setUploadFile] = React.useState(null);
      const [uploadBusy, setUploadBusy] = React.useState(false);
      const [uploadError, setUploadError] = React.useState('');

      const [notice, setNotice] = React.useState('');

      const selectedRepo = React.useMemo(
        () => repos.find((repo) => repo.slug === selectedSlug) || null,
        [repos, selectedSlug],
      );

      const filteredRepos = React.useMemo(() => {
        const needle = filter.trim().toLowerCase();
        if (!needle) return repos;
        return repos.filter((repo) => `${repo.slug} ${repo.name || ''} ${repo.description || ''}`.toLowerCase().includes(needle));
      }, [repos, filter]);

      const defaultBranch = selectedRepo ? selectedRepo.default_branch || 'main' : 'main';

      const loadRepos = React.useCallback(async (nextSlug) => {
        setReposLoading(true);
        setReposError('');
        try {
          const data = await api('/repos');
          const list = Array.isArray(data.repos) ? data.repos : [];
          setRepos(list);
          if (nextSlug) {
            setSelectedSlug(nextSlug);
          } else {
            setSelectedSlug((current) => (current && list.some((repo) => repo.slug === current) ? current : null));
          }
        } catch (error) {
          setReposError(messageFor(error, t));
        } finally {
          setReposLoading(false);
        }
      }, [t]);

      React.useEffect(() => subscribeMyGitChanged(() => {
        setRefreshTick((value) => value + 1);
        loadRepos();
      }), [loadRepos]);

      React.useEffect(() => {
        let alive = true;
        (async () => {
          try {
            const state = await api('/state');
            if (!alive) return;
            setConnection({ loading: false, configured: Boolean(state.configured), baseUrl: state.baseUrl });
            if (state.configured) await loadRepos();
          } catch (error) {
            if (!alive) return;
            setConnection((current) => ({ ...current, loading: false }));
            setReposError(messageFor(error, t));
          }
        })();
        return () => { alive = false; };
      }, [loadRepos, t]);

      React.useEffect(() => {
        if (!selectedSlug) {
          setDetail(null);
          setDetailError('');
          return undefined;
        }
        let alive = true;
        setDetail(null);
        setDetailLoading(true);
        setDetailError('');
        setFilePreview(null);
        setFileError('');
        (async () => {
          try {
            const ref = defaultBranch;
            const encodedSlug = encodeURIComponent(selectedSlug);
            const query = new URLSearchParams({ limit: '100' });
            if (ref) query.set('ref', ref);
            const treeQuery = new URLSearchParams();
            if (ref) treeQuery.set('ref', ref);
            if (treePath) treeQuery.set('path', treePath);
            const optional = (promise, fallback) => promise.catch((error) => {
              if (error && error.status === 404) return fallback;
              throw error;
            });
            const [commits, tree, branches, tags] = await Promise.all([
              optional(api(`/repos/${encodedSlug}/commits?${query.toString()}`), { commits: [] }),
              optional(api(`/repos/${encodedSlug}/tree?${treeQuery.toString()}`), { entries: [], ref: defaultBranch, path: treePath }),
              optional(api(`/repos/${encodedSlug}/branches`), { branches: [] }),
              optional(api(`/repos/${encodedSlug}/tags`), { tags: [] }),
            ]);
            if (!alive) return;
            setDetail({
              commits: commits.commits || [],
              tree: tree || { entries: [], ref: defaultBranch, path: treePath },
              branches: branches.branches || [],
              tags: tags.tags || [],
            });
          } catch (error) {
            if (!alive) return;
            setDetailError(messageFor(error, t));
          } finally {
            if (alive) setDetailLoading(false);
          }
        })();
        return () => { alive = false; };
      }, [selectedSlug, treePath, refreshTick, defaultBranch, loadRepos, t]);

      const connect = async () => {
        const token = tokenDraft.trim();
        const baseUrl = baseUrlDraft.trim();
        if (!token || !baseUrl) return;
        let parsed;
        try {
          parsed = new URL(baseUrl);
        } catch {
          setAuthError(t('setup.invalidBaseUrl'));
          return;
        }
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setAuthError(t('setup.invalidBaseUrl'));
          return;
        }
        setAuthBusy(true);
        setAuthError('');
        try {
          const result = await api('/token', { method: 'POST', body: { token, baseUrl } });
          setTokenDraft('');
          setAuthOpen(false);
          setConnection((current) => ({
            ...current,
            configured: true,
            baseUrl: (result && result.baseUrl) || baseUrl,
          }));
          setNotice(t('notice.tokenSaved'));
          await loadRepos();
        } catch (error) {
          setAuthError(error && error.status === 401 ? t('setup.invalid') : messageFor(error, t));
        } finally {
          setAuthBusy(false);
        }
      };

      const disconnect = async () => {
        setAuthBusy(true);
        setAuthError('');
        try {
          await api('/token', { method: 'DELETE' });
          setConnection((current) => ({ ...current, configured: false, baseUrl: '' }));
          setBaseUrlDraft('');
          setRepos([]);
          setSelectedSlug(null);
          setDetail(null);
          setAuthOpen(false);
          setNotice(t('notice.tokenCleared'));
        } catch (error) {
          setAuthError(messageFor(error, t));
        } finally {
          setAuthBusy(false);
        }
      };

      const createRepo = async () => {
        const slug = createValues.slug.trim();
        if (!/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(slug)) {
          setCreateError(t('repos.invalidSlug'));
          return;
        }
        setCreateBusy(true);
        setCreateError('');
        try {
          const body = { slug };
          if (createValues.name.trim()) body.name = createValues.name.trim();
          if (createValues.description.trim()) body.description = createValues.description.trim();
          await api('/repos', { method: 'POST', body });
          setCreateOpen(false);
          setCreateValues({ slug: '', name: '', description: '' });
          setNotice(t('notice.created', { slug }));
          await loadRepos(slug);
        } catch (error) {
          setCreateError(messageFor(error, t));
        } finally {
          setCreateBusy(false);
        }
      };

      const deleteRepo = async () => {
        if (!selectedRepo) return;
        setDeleteBusy(true);
        try {
          await api(`/repos/${encodeURIComponent(selectedRepo.slug)}`, { method: 'DELETE' });
          setDeleteOpen(false);
          setNotice(t('notice.deleted'));
          setSelectedSlug(null);
          setDetail(null);
          await loadRepos();
        } catch (error) {
          setDeleteOpen(false);
          setNotice(messageFor(error, t));
        } finally {
          setDeleteBusy(false);
        }
      };

      const selectRepo = (repo) => {
        setSelectedSlug(repo.slug);
        setDetail(null);
        setDetailError('');
        setTreePath('');
        setTab('files');
        setFilePreview(null);
        setUploadOpen(false);
      };

      const openFile = async (path) => {
        if (!selectedRepo) return;
        setFileBusy(true);
        setFileError('');
        setFilePreview({ path });
        try {
          const ref = detail && detail.tree ? detail.tree.ref || selectedRepo.default_branch : selectedRepo.default_branch;
          const query = new URLSearchParams({ path });
          if (ref) query.set('ref', ref);
          const data = await api(`/repos/${encodeURIComponent(selectedRepo.slug)}/file?${query.toString()}`);
          setFilePreview({ path, ...data });
        } catch (error) {
          setFileError(messageFor(error, t));
        } finally {
          setFileBusy(false);
        }
      };

      const openUpload = () => {
        setUploadValues({
          message: '',
          branch: selectedRepo ? selectedRepo.default_branch || 'main' : 'main',
          mode: 'snapshot',
          deletions: '',
        });
        setUploadFile(null);
        setUploadError('');
        setUploadOpen(true);
        setTab('files');
      };

      const publish = async () => {
        if (!selectedRepo) return;
        if (!uploadFile) {
          setUploadError(t('upload.requireFile'));
          return;
        }
        if (!uploadValues.message.trim()) {
          setUploadError(t('upload.requireMessage'));
          return;
        }
        setUploadBusy(true);
        setUploadError('');
        try {
          const body = new FormData();
          body.append('file', uploadFile);
          body.append('message', uploadValues.message.trim());
          body.append('branch', uploadValues.branch.trim() || selectedRepo.default_branch || 'main');
          body.append('mode', uploadValues.mode);
          if (uploadValues.mode === 'patch' && uploadValues.deletions.trim()) {
            body.append('deletions', uploadValues.deletions.trim());
          }
          const response = await fetch(`/mygit-lite/api/repos/${encodeURIComponent(selectedRepo.slug)}/commits`, {
            method: 'POST',
            body,
          });
          let data = null;
          try {
            data = await response.json();
          } catch {
            data = null;
          }
          if (!response.ok) {
            const error = new Error(data && typeof data.error === 'string' ? data.error : `HTTP ${response.status}`);
            error.status = response.status;
            throw error;
          }
          setUploadOpen(false);
          setNotice(t('upload.success', { hash: shortHash(data && data.commit) }));
          setRefreshTick((value) => value + 1);
        } catch (error) {
          setUploadError(messageFor(error, t));
        } finally {
          setUploadBusy(false);
        }
      };

      const pathSegments = treePath ? treePath.split('/') : [];
      const entries = detail && detail.tree && Array.isArray(detail.tree.entries) ? detail.tree.entries : [];
      const commits = detail && Array.isArray(detail.commits) ? detail.commits : [];
      const branches = detail && Array.isArray(detail.branches) ? detail.branches : [];
      const tags = detail && Array.isArray(detail.tags) ? detail.tags : [];

      if (connection.loading) {
        return h('div', { className: 'mygit-lite-panel mygit-centered' },
          h('style', null, CSS),
          h('div', { className: 'mygit-spinner', 'aria-label': t('common.loading') }),
        );
      }

      if (!connection.configured) {
        return h('div', { className: 'mygit-lite-panel mygit-setup-wrap' },
          h('style', null, CSS),
          h(Setup, {
            connection,
            baseUrl: baseUrlDraft,
            setBaseUrl: setBaseUrlDraft,
            token: tokenDraft,
            setToken: setTokenDraft,
            busy: authBusy,
            error: authError,
            onSubmit: connect,
            t,
          }),
        );
      }

      return h('div', { className: 'mygit-lite-panel' },
        h('style', null, CSS),
        h('header', { className: 'mygit-header' },
          h('div', { className: 'mygit-brand' },
            h('div', { className: 'mygit-brand-mark' }, h(BranchIcon, { size: 19 })),
            h('div', null,
              h('div', { className: 'mygit-brand-line' },
                h('h1', null, t('panel.title')),
                h('span', { className: 'mygit-status' }, h('i'), t('header.connected')),
              ),
              h('p', null, t('panel.subtitle')),
            ),
          ),
          h('div', { className: 'mygit-header-actions' },
            h('code', { className: 'mygit-base-url' }, connection.baseUrl),
            h(Button, { onClick: () => { setBaseUrlDraft(connection.baseUrl); setAuthOpen(true); } }, t('header.settings')),
            h(Button, { onClick: () => { loadRepos(); setNotice(t('notice.refreshed')); } },
              h(RefreshIcon), t('common.refresh')),
          ),
        ),
        notice ? h('div', { className: 'mygit-notice' },
          h('span', null, notice),
          h(IconButton, { label: t('common.close'), onClick: () => setNotice('') }, h(CloseIcon)),
        ) : null,
        reposError ? h('div', { className: 'mygit-error banner' }, reposError) : null,
        h('div', { className: 'mygit-body' },
          h('aside', { className: 'mygit-sidebar' },
            h('div', { className: 'mygit-sidebar-head' },
              h('div', null,
                h('h2', null, t('repos.title')),
                h('span', { className: 'mygit-count' }, repos.length),
              ),
              h(Button, { variant: 'primary', onClick: () => { setCreateOpen((value) => !value); setCreateError(''); } },
                h(PlusIcon), t('repos.new')),
            ),
            createOpen ? h(CreateRepoForm, {
              values: createValues,
              setValues: setCreateValues,
              busy: createBusy,
              error: createError,
              onSubmit: createRepo,
              onCancel: () => { setCreateOpen(false); setCreateError(''); },
              t,
            }) : null,
            h('label', { className: 'mygit-search' },
              h(SearchIcon),
              h('input', {
                value: filter,
                placeholder: t('repos.searchPlaceholder'),
                onChange: (event) => setFilter(event.target.value),
              }),
            ),
            h('div', { className: 'mygit-repo-list' },
              reposLoading && repos.length === 0 ? h('div', { className: 'mygit-list-loading' }, t('common.loading')) : null,
              filteredRepos.map((repo) => h('button', {
                key: repo.slug,
                type: 'button',
                className: cx('mygit-repo-row', repo.slug === selectedSlug && 'is-active'),
                onClick: () => selectRepo(repo),
              },
                h('div', { className: 'mygit-repo-top' },
                  h('span', { className: 'mygit-repo-name' }, repo.name || repo.slug),
                  h('span', { className: 'mygit-repo-slug' }, repo.slug),
                ),
                h('div', { className: 'mygit-repo-meta' },
                  h('span', null, repo.head ? shortHash(repo.head) : t('common.none')),
                  h('span', null, repo.default_branch || 'main'),
                ),
              )),
              !reposLoading && repos.length === 0 ? h(Empty, { title: t('repos.empty'), hint: t('repos.emptyHint') }) : null,
              !reposLoading && repos.length > 0 && filteredRepos.length === 0
                ? h('div', { className: 'mygit-list-empty' }, t('repos.filteredEmpty'))
                : null,
            ),
          ),
          h('section', { className: 'mygit-detail' },
            !selectedRepo ? h(Empty, { title: t('detail.emptyTitle'), hint: t('detail.emptyHint') }) : h(React.Fragment, null,
              h('div', { className: 'mygit-detail-head' },
                h('div', { className: 'mygit-detail-title' },
                  h('div', { className: 'mygit-title-row' },
                    h('h2', null, selectedRepo.name || selectedRepo.slug),
                    h('span', { className: 'mygit-chip' }, selectedRepo.slug),
                    h('span', { className: 'mygit-chip subtle' }, `${t('detail.defaultBranch')}: ${selectedRepo.default_branch || 'main'}`),
                  ),
                  selectedRepo.description ? h('p', null, selectedRepo.description) : null,
                  h('div', { className: 'mygit-meta-line' },
                    h('span', null, `${t('detail.head')}: `, h('code', null, shortHash(selectedRepo.head))),
                    h('span', null, `${t('detail.created')}: ${formatDate(selectedRepo.created_at)}`),
                  ),
                ),
                h('div', { className: 'mygit-detail-actions' },
                  h(Button, { variant: 'primary', onClick: openUpload }, h(UploadIcon), t('detail.upload')),
                  h(Button, { variant: 'danger', onClick: () => setDeleteOpen(true) }, h(TrashIcon), t('detail.delete')),
                ),
              ),
              uploadOpen ? h(UploadForm, {
                repo: selectedRepo,
                values: uploadValues,
                setValues: setUploadValues,
                file: uploadFile,
                setFile: setUploadFile,
                busy: uploadBusy,
                error: uploadError,
                onSubmit: publish,
                onCancel: () => { setUploadOpen(false); setUploadError(''); },
                t,
              }) : null,
              h('div', { className: 'mygit-tabs', role: 'tablist' },
                [['files', t('detail.filesTab')], ['history', t('detail.historyTab')], ['branches', t('detail.branchesTab')], ['tags', t('detail.tagsTab')]].map(([key, label]) =>
                  h('button', {
                    key,
                    type: 'button',
                    role: 'tab',
                    'aria-selected': tab === key,
                    className: cx('mygit-tab', tab === key && 'is-active'),
                    onClick: () => setTab(key),
                  }, label),
                ),
              ),
              detailError ? h('div', { className: 'mygit-error banner' },
                h('span', null, detailError),
                h(Button, { onClick: () => setRefreshTick((value) => value + 1) }, t('common.retry')),
              ) : null,
              detailLoading && !detail ? h('div', { className: 'mygit-centered-fill' }, h('div', { className: 'mygit-spinner' })) : null,
              !detailLoading && !detail && !detailError ? h('div', { className: 'mygit-centered-fill' }, t('common.loading')) : null,
              detail && tab === 'files' ? h('div', { className: 'mygit-files' },
                h('nav', { className: 'mygit-breadcrumb', 'aria-label': t('detail.path') },
                  h('button', { type: 'button', onClick: () => { setTreePath(''); setFilePreview(null); } }, 'root'),
                  pathSegments.map((part, index) => h(React.Fragment, { key: `${part}-${index}` },
                    h(ChevronIcon, { size: 12 }),
                    h('button', {
                      type: 'button',
                      onClick: () => { setTreePath(pathSegments.slice(0, index + 1).join('/')); setFilePreview(null); },
                    }, part),
                  )),
                ),
                h('div', { className: 'mygit-file-layout' },
                  h('div', { className: 'mygit-file-table' },
                    h('div', { className: 'mygit-file-head' },
                      h('span', null, t('table.name')),
                      h('span', null, t('table.size')),
                      h('span', null, t('table.hash')),
                    ),
                    entries.length === 0 ? h('div', { className: 'mygit-list-empty' }, t('detail.noFiles')) : null,
                    entries.map((entry) => {
                      const isDir = entry.type === 'dir';
                      const fullPath = treePath ? `${treePath}/${entry.name}` : entry.name;
                      return h('button', {
                        key: entry.name,
                        type: 'button',
                        className: 'mygit-file-row',
                        onClick: () => {
                          if (isDir) {
                            setTreePath(fullPath);
                            setFilePreview(null);
                          } else {
                            openFile(fullPath);
                          }
                        },
                      },
                        h('span', { className: 'mygit-file-name' },
                          isDir ? h(FolderIcon) : h(FileIcon),
                          h('span', null, entry.name),
                        ),
                        h('span', { className: 'mygit-mono muted' }, isDir ? '—' : formatBytes(entry.size)),
                        h('code', { className: 'mygit-file-hash' }, entry.hash ? shortHash(entry.hash) : '—'),
                      );
                    }),
                  ),
                  filePreview ? h('aside', { className: 'mygit-preview' },
                    h('div', { className: 'mygit-preview-head' },
                      h('div', null,
                        h('strong', null, filePreview.path.split('/').pop()),
                        h('span', { className: 'mygit-preview-path' }, filePreview.path),
                      ),
                      h(IconButton, { label: t('file.close'), onClick: () => { setFilePreview(null); setFileError(''); } }, h(CloseIcon)),
                    ),
                    fileBusy ? h('div', { className: 'mygit-preview-body muted' }, t('file.loading')) : null,
                    !fileBusy && fileError ? h('div', { className: 'mygit-error small' }, fileError) : null,
                    !fileBusy && !fileError && filePreview.binary ? h('div', { className: 'mygit-preview-body muted' },
                      h('p', null, t('file.binary')),
                      h('p', { className: 'mygit-mono' }, formatBytes(filePreview.size)),
                    ) : null,
                    !fileBusy && !fileError && !filePreview.binary && typeof filePreview.text === 'string'
                      ? h('div', { className: 'mygit-preview-body' },
                        h('pre', null, filePreview.text),
                        filePreview.truncated ? h('p', { className: 'mygit-muted' }, t('file.truncated')) : null,
                      )
                      : null,
                  ) : null,
                ),
              ) : null,
              detail && tab === 'history' ? h('div', { className: 'mygit-table' },
                h('div', { className: 'mygit-table-head history' },
                  h('span', null, t('table.hash')),
                  h('span', null, t('table.message')),
                  h('span', null, t('table.author')),
                  h('span', null, t('table.date')),
                ),
                commits.length === 0 ? h('div', { className: 'mygit-list-empty' }, t('detail.noCommits')) : null,
                commits.map((commit) => h('div', { className: 'mygit-table-row history', key: commit.hash },
                  h('code', { title: commit.hash }, shortHash(commit.hash)),
                  h('span', { className: 'mygit-commit-message' }, commit.message || '—'),
                  h('span', { className: 'muted' }, commit.author || '—'),
                  h('span', { className: 'muted' }, formatDate(commit.created_at)),
                )),
              ) : null,
              detail && tab === 'branches' ? h('div', { className: 'mygit-table' },
                h('div', { className: 'mygit-table-head branches' },
                  h('span', null, t('table.name')),
                  h('span', null, t('table.commit')),
                  h('span', null, t('table.updated')),
                ),
                branches.length === 0 ? h('div', { className: 'mygit-list-empty' }, t('detail.noBranches')) : null,
                branches.map((branch) => h('div', { className: 'mygit-table-row branches', key: branch.name },
                  h('span', { className: 'mygit-name-cell' },
                    h('strong', null, branch.name),
                    branch.default ? h('span', { className: 'mygit-chip subtle' }, t('table.default')) : null,
                  ),
                  h('code', null, shortHash(branch.head)),
                  h('span', { className: 'muted' }, formatDate(branch.updated_at)),
                )),
              ) : null,
              detail && tab === 'tags' ? h('div', { className: 'mygit-table' },
                h('div', { className: 'mygit-table-head tags' },
                  h('span', null, t('table.name')),
                  h('span', null, t('table.commit')),
                  h('span', null, t('table.message')),
                  h('span', null, t('table.date')),
                ),
                tags.length === 0 ? h('div', { className: 'mygit-list-empty' }, t('detail.noTags')) : null,
                tags.map((tag) => h('div', { className: 'mygit-table-row tags', key: tag.name },
                  h('strong', null, tag.name),
                  h('code', null, shortHash(tag.commit)),
                  h('span', { className: 'mygit-commit-message' }, tag.message || '—'),
                  h('span', { className: 'muted' }, formatDate(tag.created_at)),
                )),
              ) : null,
            ),
          ),
        ),
        authOpen ? h(Modal, { title: t('header.settings'), closeLabel: t('common.close'), onClose: () => { setAuthOpen(false); setAuthError(''); } },
          h(TokenForm, {
            connection,
            baseUrl: baseUrlDraft,
            setBaseUrl: setBaseUrlDraft,
            token: tokenDraft,
            setToken: setTokenDraft,
            busy: authBusy,
            error: authError,
            submitLabel: t('common.save'),
            onSubmit: connect,
            onDisconnect: disconnect,
            t,
          }),
        ) : null,
        deleteOpen && selectedRepo ? h(Modal, { title: t('repos.deleteTitle'), closeLabel: t('common.close'), onClose: () => setDeleteOpen(false) },
          h('div', { className: 'mygit-confirm' },
            h('p', null, t('repos.deleteBody', { name: selectedRepo.name || selectedRepo.slug })),
            h('div', { className: 'mygit-form-actions' },
              h(Button, { onClick: () => setDeleteOpen(false) }, t('common.cancel')),
              h(Button, { variant: 'danger', onClick: deleteRepo, disabled: deleteBusy },
                deleteBusy ? t('repos.deleting') : t('repos.deleteConfirm')),
            ),
          ),
        ) : null,
      );
    }

    function SidebarIcon({ size = 20, active = false }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: active ? 2 : 1.75,
        strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
      },
        h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 5, opacity: 0.55 }),
        h('circle', { cx: 8, cy: 8.5, r: 1.7 }),
        h('circle', { cx: 8, cy: 16, r: 1.7 }),
        h('circle', { cx: 16.5, cy: 10.5, r: 1.7 }),
        h('path', { d: 'M8 10.2v4.1M9.7 10.2h4.5a2 2 0 0 1 2 2v.1' }),
      );
    }

    const CSS = `
.mygit-lite-panel{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;overflow:hidden}
.mygit-lite-panel *{box-sizing:border-box}
.mygit-lite-panel h1,.mygit-lite-panel h2,.mygit-lite-panel h3,.mygit-lite-panel p{margin:0}
.mygit-lite-panel button{font:inherit}
.mygit-centered{display:flex;align-items:center;justify-content:center}
.mygit-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 22px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-specific-sidebar-fill);flex:none}
.mygit-brand{display:flex;align-items:center;gap:12px;min-width:0}
.mygit-brand-mark{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-brand-primary);flex:none}
.mygit-brand-line{display:flex;align-items:center;gap:10px}
.mygit-brand-line h1{font-size:17px;line-height:1.2;font-weight:650;letter-spacing:.01em}
.mygit-brand p{color:var(--dsw-alias-label-secondary);font-size:12px;margin-top:3px}
.mygit-status{display:inline-flex;align-items:center;gap:5px;color:var(--dsw-alias-label-secondary);font-size:11px;padding:2px 7px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;white-space:nowrap}
.mygit-status i{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-success-primary);display:block}
.mygit-header-actions{display:flex;align-items:center;gap:8px;flex:none}
.mygit-base-url{padding:4px 8px;border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:11px;border:1px solid var(--dsw-alias-border-l1);max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mygit-body{display:grid;grid-template-columns:288px minmax(0,1fr);flex:1;min-height:0}
.mygit-sidebar{border-right:1px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column;min-height:0;background:var(--dsw-specific-sidebar-fill)}
.mygit-sidebar-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 14px 10px}
.mygit-sidebar-head h2{font-size:13px;font-weight:650;letter-spacing:.02em}
.mygit-sidebar-head>div:first-child{display:flex;align-items:center;gap:7px}
.mygit-count{font-size:11px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:1px 6px}
.mygit-search{display:flex;align-items:center;gap:7px;margin:4px 14px 8px;padding:0 9px;height:32px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);flex:none}
.mygit-search:focus-within{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary)}
.mygit-search input{border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);width:100%;min-width:0;font-size:12px}
.mygit-repo-list{overflow:auto;padding:0 8px 16px;min-height:0;flex:1}
.mygit-repo-row{display:block;width:100%;text-align:left;border:1px solid transparent;background:transparent;color:inherit;border-radius:8px;padding:9px 10px;cursor:pointer}
.mygit-repo-row:hover{background:var(--dsw-alias-bg-layer-1)}
.mygit-repo-row.is-active{background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l1)}
.mygit-repo-top{display:flex;align-items:baseline;gap:7px;min-width:0}
.mygit-repo-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.mygit-repo-slug{font-size:10px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mygit-repo-meta{display:flex;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-secondary);font-size:10px;margin-top:4px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.mygit-detail{overflow:auto;min-height:0;padding:20px 24px 28px}
.mygit-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap}
.mygit-detail-title{min-width:0}
.mygit-title-row{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.mygit-title-row h2{font-size:22px;line-height:1.2;font-weight:650;letter-spacing:-.01em}
.mygit-chip{font-size:10px;line-height:1;padding:4px 7px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);white-space:nowrap}
.mygit-chip.subtle{background:transparent}
.mygit-detail-title>p{color:var(--dsw-alias-label-secondary);margin-top:7px;font-size:12.5px;max-width:760px}
.mygit-meta-line{display:flex;gap:16px;flex-wrap:wrap;color:var(--dsw-alias-label-secondary);font-size:11.5px;margin-top:9px}
.mygit-meta-line code{color:var(--dsw-alias-label-primary)}
.mygit-detail-actions{display:flex;gap:8px;flex-wrap:wrap}
.mygit-tabs{display:flex;gap:2px;border-bottom:1px solid var(--dsw-alias-border-l1);margin-top:18px;flex:none}
.mygit-tab{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);padding:9px 12px 10px;border-bottom:2px solid transparent;cursor:pointer;font-size:12.5px}
.mygit-tab:hover{color:var(--dsw-alias-label-primary)}
.mygit-tab.is-active{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-brand-primary);font-weight:600}
.mygit-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:31px;padding:0 11px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;font-size:12px;line-height:1;white-space:nowrap;text-decoration:none}
.mygit-btn:hover:not(:disabled){border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2)}
.mygit-btn:focus-visible,.mygit-icon-btn:focus-visible,.mygit-tab:focus-visible,.mygit-repo-row:focus-visible,.mygit-file-row:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.mygit-btn:disabled{opacity:.55;cursor:not-allowed}
.mygit-btn.is-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}
.mygit-btn.is-primary:hover:not(:disabled){background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);filter:brightness(1.08)}
.mygit-btn.is-danger{color:var(--dsw-alias-state-error-primary)}
.mygit-btn.is-danger:hover:not(:disabled){border-color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-1)}
.mygit-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none}
.mygit-icon-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.mygit-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--dsw-alias-label-secondary);padding:42px 22px;gap:7px;min-height:220px}
.mygit-empty-mark{width:52px;height:52px;border-radius:15px;border:1px solid var(--dsw-alias-border-l1);display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1);margin-bottom:2px}
.mygit-empty h3{font-size:14px;color:var(--dsw-alias-label-primary);font-weight:600}
.mygit-empty p{font-size:12px;max-width:320px;line-height:1.5}
.mygit-list-empty,.mygit-list-loading{padding:18px 10px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:12px}
.mygit-notice{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 22px;background:var(--dsw-alias-bg-layer-1);border-bottom:1px solid var(--dsw-alias-border-l1);font-size:12px;color:var(--dsw-alias-label-secondary)}
.mygit-error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.45;border:1px solid var(--dsw-alias-state-error-primary);border-radius:8px;padding:8px 10px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent);margin-top:10px}
.mygit-error.small{font-size:11px;padding:6px 8px}
.mygit-error.banner{margin:10px 22px 0;display:flex;align-items:center;justify-content:space-between;gap:10px;flex:none}
.mygit-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.mygit-field>span{font-size:11px;color:var(--dsw-alias-label-secondary);font-weight:550}
.mygit-field input,.mygit-field textarea,.mygit-field select{width:100%;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);padding:8px 9px;font:inherit;font-size:12.5px;outline:0}
.mygit-field input:focus,.mygit-field textarea:focus,.mygit-field select:focus{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary)}
.mygit-field small{font-size:10.5px;color:var(--dsw-alias-label-secondary);line-height:1.45}
.mygit-field.compact{gap:4px;margin-bottom:8px}
.mygit-field.compact input,.mygit-field.compact textarea{padding:6px 8px;font-size:12px}
.mygit-form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px;flex-wrap:wrap}
.mygit-setup-wrap{display:flex;align-items:center;justify-content:center;overflow:auto;padding:22px}
.mygit-setup{width:min(470px,100%)}
.mygit-setup-card{border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-layer-1);padding:26px;box-shadow:0 18px 50px rgba(0,0,0,.08)}
.mygit-setup-mark{width:50px;height:50px;border-radius:14px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-brand-primary);margin-bottom:14px}
.mygit-setup-card h1{font-size:20px;line-height:1.2;margin-bottom:8px}
.mygit-token-form{margin-top:12px}
.mygit-muted{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.55}
.mygit-token-form>.mygit-muted{margin-bottom:16px}
.mygit-endpoint{display:flex;align-items:center;gap:8px;margin-top:13px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);font-size:11px;color:var(--dsw-alias-label-secondary)}
.mygit-endpoint span{font-size:9px;letter-spacing:.08em;border:1px solid var(--dsw-alias-border-l1);border-radius:4px;padding:2px 4px}
.mygit-endpoint code{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis}
.mygit-security{font-size:10.5px;line-height:1.5;color:var(--dsw-alias-label-secondary);margin-top:12px}
.mygit-modal-backdrop{position:absolute;inset:0;z-index:20;background:color-mix(in srgb,#000 36%,transparent);display:flex;align-items:center;justify-content:center;padding:18px}
.mygit-modal{width:min(470px,100%);max-height:calc(100% - 36px);overflow:auto;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;padding:18px;box-shadow:0 24px 70px rgba(0,0,0,.28)}
.mygit-modal-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.mygit-modal-head h2{font-size:15px;font-weight:650}
.mygit-confirm p{font-size:12.5px;line-height:1.55;color:var(--dsw-alias-label-secondary)}
.mygit-create{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:10px;margin:0 14px 8px;flex:none}
.mygit-create-title{font-size:11px;color:var(--dsw-alias-label-secondary);font-weight:600;margin-bottom:7px}
.mygit-create .mygit-form-actions{margin-top:4px}
.mygit-upload{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:12px;padding:14px;margin-top:14px}
.mygit-upload-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.mygit-upload-head h3{font-size:13px;font-weight:650}
.mygit-upload-head p{font-size:10.5px;margin-top:4px;max-width:560px}
.mygit-upload-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.mygit-upload-grid .wide{grid-column:1/-1}
.mygit-file-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:14px;margin-top:10px}
.mygit-file-layout:has(.mygit-preview){grid-template-columns:minmax(0,1fr) minmax(260px,42%)}
.mygit-breadcrumb{display:flex;align-items:center;gap:3px;flex-wrap:wrap;padding:9px 0;color:var(--dsw-alias-label-secondary);font-size:11.5px}
.mygit-breadcrumb button{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;padding:2px 4px;border-radius:4px}
.mygit-breadcrumb button:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}
.mygit-file-table,.mygit-table{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:hidden;background:var(--dsw-alias-bg-layer-1);margin-top:10px}
.mygit-file-head,.mygit-table-head{display:grid;gap:10px;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:10px;letter-spacing:.04em;text-transform:uppercase}
.mygit-file-head{grid-template-columns:minmax(0,1fr) 78px 86px}
.mygit-file-row{display:grid;grid-template-columns:minmax(0,1fr) 78px 86px;gap:10px;align-items:center;width:100%;border:0;border-bottom:1px solid var(--dsw-alias-border-l1);background:transparent;color:inherit;padding:8px 12px;cursor:pointer;text-align:left;font-size:12px}
.mygit-file-row:last-child{border-bottom:0}
.mygit-file-row:hover{background:var(--dsw-alias-bg-layer-2)}
.mygit-file-name{display:flex;align-items:center;gap:7px;min-width:0;color:var(--dsw-alias-label-primary)}
.mygit-file-name>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mygit-file-name svg{color:var(--dsw-alias-label-secondary);flex:none}
.mygit-file-hash{color:var(--dsw-alias-label-secondary);font-size:10px;overflow:hidden;text-overflow:ellipsis}
.mygit-mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.mygit-muted{color:var(--dsw-alias-label-secondary)}
.mygit-preview{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;min-height:240px;max-height:520px;overflow:hidden}
.mygit-preview-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:9px 10px;border-bottom:1px solid var(--dsw-alias-border-l1);min-width:0}
.mygit-preview-head strong{display:block;font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mygit-preview-path{display:block;color:var(--dsw-alias-label-secondary);font-size:9.5px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:300px}
.mygit-preview-body{padding:10px;overflow:auto;min-height:0;flex:1}
.mygit-preview-body pre{margin:0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11px;line-height:1.55;color:var(--dsw-alias-label-primary)}
.mygit-table-head.history,.mygit-table-row.history{grid-template-columns:82px minmax(0,1fr) 110px 140px}
.mygit-table-head.branches,.mygit-table-row.branches{grid-template-columns:minmax(0,1fr) 110px 160px}
.mygit-table-head.tags,.mygit-table-row.tags{grid-template-columns:130px 100px minmax(0,1fr) 140px}
.mygit-table-row{display:grid;gap:10px;padding:9px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center;font-size:12px;min-width:0}
.mygit-table-row:last-child{border-bottom:0}
.mygit-table-row code{font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.mygit-commit-message{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mygit-name-cell{display:flex;align-items:center;gap:7px;min-width:0}
.mygit-name-cell strong{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mygit-centered-fill{height:180px;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);font-size:12px}
.mygit-spinner{width:22px;height:22px;border:2px solid var(--dsw-alias-border-l1);border-top-color:var(--dsw-alias-brand-primary);border-radius:50%;animation:mygit-spin .8s linear infinite}
.mygit-spinner.small{width:16px;height:16px;border-width:2px}
@keyframes mygit-spin{to{transform:rotate(360deg)}}
.mygit-composer-btn{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;line-height:1;cursor:pointer;white-space:nowrap}
.mygit-composer-btn:hover{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}
.mygit-composer-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.mygit-workspace-backdrop{position:fixed;inset:0;z-index:1200;background:color-mix(in srgb,#000 38%,transparent);display:flex;align-items:center;justify-content:center;padding:22px;pointer-events:auto}
.mygit-workspace-dialog{width:min(650px,100%);max-height:min(90vh,820px);overflow:auto;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l1);border-radius:16px;padding:20px;box-shadow:0 28px 90px rgba(0,0,0,.32);font:inherit;font-size:13px}
.mygit-workspace-dialog *{box-sizing:border-box}
.mygit-workspace-dialog h2,.mygit-workspace-dialog h3,.mygit-workspace-dialog p{margin:0}
.mygit-workspace-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}
.mygit-workspace-heading{display:flex;align-items:flex-start;gap:11px;min-width:0}
.mygit-workspace-mark{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-brand-primary);flex:none}
.mygit-workspace-heading h2{font-size:16px;line-height:1.25;font-weight:650}
.mygit-workspace-heading p{color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:1.5;margin-top:4px;max-width:520px}
.mygit-workspace-loading{height:150px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--dsw-alias-label-secondary);font-size:12px}
.mygit-workspace-message{padding:6px 0 2px}
.mygit-workspace-message>p{color:var(--dsw-alias-label-secondary);line-height:1.55}
.mygit-workspace-form{margin-top:2px}
.mygit-workspace-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.mygit-workspace-grid .wide{grid-column:1/-1}
.mygit-workspace-path{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:9.5px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mygit-workspace-note{font-size:10.5px;line-height:1.5;color:var(--dsw-alias-label-secondary);margin-top:13px}
.mygit-workspace-progress{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-secondary);font-size:11.5px;margin-top:12px}
.mygit-workspace-success{padding:2px 0}
.mygit-workspace-success-mark{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-state-success-primary);margin-bottom:10px}
.mygit-workspace-success h3{font-size:15px;font-weight:650;margin-bottom:3px}
.mygit-workspace-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:15px 0}
.mygit-workspace-stats>div{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:9px;padding:9px;min-width:0}
.mygit-workspace-stats span{display:block;color:var(--dsw-alias-label-secondary);font-size:9.5px;margin-bottom:4px}
.mygit-workspace-stats strong,.mygit-workspace-stats code{display:block;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mygit-workspace-stats code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--dsw-alias-label-primary)}
@media (max-width:760px){.mygit-composer-btn span{display:none}.mygit-composer-btn{width:28px;padding:0;justify-content:center}.mygit-workspace-grid{grid-template-columns:1fr}.mygit-workspace-stats{grid-template-columns:1fr 1fr}}
@media (max-width:960px){.mygit-base-url{display:none}.mygit-detail{padding:16px}.mygit-body{grid-template-columns:250px minmax(0,1fr)}}
@media (max-width:760px){.mygit-header{align-items:flex-start;flex-direction:column}.mygit-header-actions{width:100%;justify-content:flex-end}.mygit-body{grid-template-columns:220px minmax(0,1fr)}.mygit-upload-grid{grid-template-columns:1fr}.mygit-file-layout:has(.mygit-preview){grid-template-columns:1fr}.mygit-table-head.history,.mygit-table-row.history{grid-template-columns:70px minmax(0,1fr)}.mygit-table-head.history span:nth-child(3),.mygit-table-head.history span:nth-child(4),.mygit-table-row.history span:nth-child(3),.mygit-table-row.history span:nth-child(4){display:none}}
`;

    return {
      inject: ['slots', 'locale', 'layout'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, TEXT), 'mygit-lite: locale');
        const t = () => ctx.locale.bind(NS);
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: 'mygit-lite',
          order: 20,
          label: () => t()('panel.title'),
        }, SidebarIcon));
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: 'mygit-lite',
        }, () => h(Panel, { ctx })));
        ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left',
          id: 'mygit-lite-upload',
          order: 20,
        }, (props) => h(WorkspaceUploadButton, { ctx, sessionId: props.sessionId })));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'mygit-lite-workspace-upload',
          order: 100,
        }, () => h(WorkspaceUploadOverlay, { ctx })));
      },
    };
  },
});
