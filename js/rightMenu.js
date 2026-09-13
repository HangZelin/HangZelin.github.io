(() => {
  const init = () => {
    if (document.getElementById('rightMenu')) return;
    document.body.insertAdjacentHTML('beforeend', "<div id=\"rightMenu\"><div class=\"rightMenu-group rightMenu-small\"><div class=\"rightMenu-item\" id=\"menu-backward\"><i class=\"fa-solid fa-arrow-left\"></i></div><div class=\"rightMenu-item\" id=\"menu-forward\"><i class=\"fa-solid fa-arrow-right\"></i></div><div class=\"rightMenu-item\" id=\"menu-refresh\"><i class=\"fa-solid fa-arrow-rotate-right\"></i></div><div class=\"rightMenu-item\" id=\"menu-home\"><i class=\"fa-solid fa-house\"></i></div></div><div class=\"rightMenu-group rightMenu-line rightMenuOther\"><a class=\"rightMenu-item menu-link\" href=\"/archives/\"><i class=\"fa-solid fa-archive\"></i><span>文章归档</span></a><a class=\"rightMenu-item menu-link\" href=\"/categories/\"><i class=\"fa-solid fa-folder-open\"></i><span>文章分类</span></a><a class=\"rightMenu-item menu-link\" href=\"/tags/\"><i class=\"fa-solid fa-tags\"></i><span>文章标签</span></a></div><div class=\"rightMenu-group rightMenu-line rightMenuNormal\"><div class=\"rightMenu-item\" id=\"menu-translate\"><i class=\"fa-solid fa-earth-asia\"></i><span>繁简切换</span></div><div class=\"rightMenu-item\" id=\"menu-darkmode\"><i class=\"fa-solid fa-moon\"></i><span>切换模式</span></div><div class=\"rightMenu-item\" id=\"menu-print\"><i class=\"fa-solid fa-print fa-fw\"></i><span>打印页面</span></div></div></div><div id=\"rightmenu-mask\"></div>");
    const menu = document.getElementById('rightMenu'), mask = document.getElementById('rightmenu-mask');
    const close = () => { menu.style.display = 'none'; mask.style.display = 'none'; };
    const actions = {
      'menu-backward': () => history.back(), 'menu-forward': () => history.forward(),
      'menu-refresh': () => location.reload(), 'menu-home': () => { if (window.pjax) window.pjax.loadUrl('/'); else location.href = '/'; },
      'menu-translate': () => document.getElementById('translateLink')?.click(),
      'menu-darkmode': () => document.getElementById('darkmode')?.click(),
      'menu-print': () => window.print()
    };
    for (const [id, action] of Object.entries(actions)) {
      const button = document.getElementById(id); button.setAttribute('role', 'button'); button.tabIndex = 0;
      button.addEventListener('click', () => {close(); action();});
      button.addEventListener('keydown', e => {if(e.key === 'Enter' || e.key === ' ') {e.preventDefault(); button.click();}});
    }
    document.addEventListener('contextmenu', e => {
      if (innerWidth <= 768 || e.target.closest('input,textarea,[contenteditable]')) return;
      e.preventDefault(); menu.style.display = 'block'; mask.style.display = 'flex';
      menu.style.left = Math.max(0, Math.min(e.clientX, innerWidth - menu.offsetWidth)) + 'px';
      menu.style.top = Math.max(0, Math.min(e.clientY, innerHeight - menu.offsetHeight)) + 'px';
    });
    mask.addEventListener('click', close); document.addEventListener('scroll', close, {passive:true});
    document.addEventListener('pjax:complete', close); document.addEventListener('keydown', e => {if(e.key === 'Escape') close();});
    close();
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
