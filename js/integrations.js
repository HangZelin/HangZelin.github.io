(() => {
  const init = () => {
    const posts = document.querySelector('#recent-posts');
    if (posts && !document.querySelector('#github-status-card')) {
      const card = document.createElement('section');
      card.id = 'github-status-card'; card.className = 'recent-post-item integration-card';
      card.innerHTML = '<h2>GitHub 动态</h2><div class="contribution-grid" aria-label="GitHub 贡献日历"></div><p class="integration-status">正在读取贡献记录…</p><a href="https://github.com/HangZelin" target="_blank" rel="noopener">查看 GitHub 主页</a>';
      posts.prepend(card);
      fetch('/data/github.json').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => {
        if (!Array.isArray(data.days) || data.days.length < 350) throw Error();
        const grid = card.querySelector('.contribution-grid');
        data.days.forEach(day => { const dot = document.createElement('span'); dot.className = 'contribution-day level-' + day.level; dot.title = day.date + ': ' + day.label; grid.append(dot); });
        card.querySelector('.integration-status').textContent = '更新于 ' + new Date(data.updatedAt).toLocaleString('zh-CN');
      }).catch(() => { card.querySelector('.integration-status').textContent = '贡献记录暂不可用，可前往 GitHub 查看。'; });
    }
    const aside = document.querySelector('#aside-content');
    if (aside && !document.querySelector('#visitor-globe-card')) {
      const card = document.createElement('section');card.id = 'visitor-globe-card';card.className = 'card-widget integration-card';
      card.innerHTML = '<h3>访客地图</h3><div id="visitor-globe"></div><p class="integration-status">地图由 ClustrMaps 提供，若未显示，可在原站查看。</p><a href="https://clustrmaps.com/" target="_blank" rel="noopener">ClustrMaps</a>';
      aside.append(card);
      if (!document.getElementById('clstr_globe')) { const script = document.createElement('script');script.id = 'clstr_globe';script.src = 'https://clustrmaps.com/globe.js?d=Y0VSyADWx2QaGmn8YuD8evV_TkqMyXZ51eV3lbgpMY4';script.async = true;script.onerror = () => {card.querySelector('.integration-status').textContent = '地图服务暂不可达，历史统计需在 ClustrMaps 账号内确认。';};card.querySelector('#visitor-globe').append(script); }
    }
    if (!document.getElementById('music-panel')) {
      const panel = document.createElement('details');panel.id = 'music-panel';
      panel.innerHTML = '<summary>♫ 网易云歌单</summary><a href="https://music.163.com/#/playlist?id=8692607455" target="_blank" rel="noopener">在网易云打开歌单</a><p class="integration-status">播放器未显示或无法播放时，请在网易云打开歌单。</p><div class="music-embed"></div>';
      panel.addEventListener('toggle', () => { if(panel.open&&!panel.querySelector('iframe')) {const frame=document.createElement('iframe');frame.title='网易云歌单播放器';frame.src='https://music.163.com/outchain/player?type=0&id=8692607455&auto=0&height=430';frame.width='310';frame.height='450';frame.loading='lazy';frame.allow='autoplay';panel.querySelector('.music-embed').append(frame);}}, {once:false});
      document.body.append(panel);
    }
    if (!document.getElementById('live2d-local-loader')) {
      const script=document.createElement('script');script.id='live2d-local-loader';script.src='/live2dw/lib/L2Dwidget.min.js';
      script.onload=()=>window.L2Dwidget?.init({tagMode:false,debug:false,model:{jsonPath:'/live2dw/assets/hibiki.model.json'},display:{position:'right',width:150,height:300,hOffset:20,vOffset:-20},mobile:{show:true},log:false,pluginJsPath:'lib/',pluginModelPath:'assets/',pluginRootPath:'live2dw/'});
      document.body.append(script);
    }
  };
  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('pjax:complete', init);
  if (document.readyState !== 'loading') init();
})();
