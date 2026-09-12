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
    if (!document.getElementById('site-music-player') && window.APlayer) {
      const container = document.createElement('div');
      container.id = 'site-music-player'; container.className = 'no-destroy';
      document.body.append(container);
      const player = new APlayer({container, fixed:true, mini:true, listFolded:false, order:'list', preload:'none', autoplay:false, audio:[]});
      let loading = false;
      const showStatus = (message, retry) => {
        player.template.title.textContent = message;
        player.template.author.textContent = ' · ';
        const link = document.createElement('a'); link.href = 'https://music.163.com/#/playlist?id=8692607455';
        link.target = '_blank'; link.rel = 'noopener'; link.textContent = '网易云 ↗';
        player.template.author.append(link);
        if (retry) {
          const button = document.createElement('button'); button.type = 'button'; button.className = 'music-retry'; button.textContent = '重试';
          button.addEventListener('click', loadPlaylist); player.template.author.append(button);
        }
      };
      const escape = text => String(text || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      async function loadPlaylist() {
        if (loading) return; loading = true; showStatus('正在加载歌单…', false);
        try {
          const response = await fetch('https://api.i-meto.com/meting/api?server=netease&type=playlist&id=8692607455', {signal:AbortSignal.timeout(12000)});
          if (!response.ok) throw Error('Playlist request failed');
          const data = await response.json();
          if (!Array.isArray(data)) throw Error('Invalid playlist');
          const tracks = data.filter(track => typeof track.url === 'string' && /^https:\/\//.test(track.url)).map(track => ({name:escape(track.name || track.title),artist:escape(track.artist || track.author),url:track.url,cover:typeof track.cover === 'string' && /^https:\/\//.test(track.cover) ? track.cover : ''}));
          if (!tracks.length) throw Error('Empty playlist');
          player.list.clear(); player.list.add(tracks);
        } catch (_) { showStatus('歌单暂时不可用', true); }
        finally { loading = false; }
      }
      loadPlaylist();
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
