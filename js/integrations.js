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
      const player = new APlayer({container, fixed:true, mini:true, listFolded:false, order:'list', preload:'auto', autoplay:false, audio:[], customAudioType:{
        unavailable: (element, track, instance) => { instance.pause(); element.removeAttribute('src'); element.load(); }
      }});
      const play = player.play.bind(player);
      player.play = () => {
        const track = player.list.audios[player.list.index];
        if (!track?.url) { player.notice(track?.pending ? '音源正在加载，请稍候' : '这首歌暂时没有可用音源，可前往网易云收听', 4000); return; }
        return play();
      };
      container.addEventListener('click', event => {
        const row = event.target.closest('.aplayer-list li');
        if (!row) return;
        event.stopImmediatePropagation();
        const index = Array.from(player.template.listOl.children).indexOf(row);
        if (index < 0) return;
        if (index !== player.list.index) { player.list.switch(index); player.play(); }
        else player.toggle();
      }, true);
      let loading = false;
      const showStatus = (message, retry) => {
        player.template.title.textContent = message;
        player.template.author.textContent = ' · ';
        const link = document.createElement('a'); link.href = 'https://music.163.com/#/playlist?id=18377477423';
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
          const configResponse = await fetch('/data/music-config.json', {cache:'no-store', signal:AbortSignal.timeout(12000)});
          if (!configResponse.ok) throw Error('Music configuration unavailable');
          const config = await configResponse.json();
          const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
          const base = local ? (config.localApiBase || config.apiBase) : config.apiBase;
          if (!base) { showStatus('音乐接口待配置', false); return; }
          const api = new URL(base);
          if (api.protocol !== 'https:' && !(local && api.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(api.hostname))) throw Error('Invalid API address');
          const request = async (route, params) => {
            const url = new URL(api.href.replace(/\/$/, '') + route);
            url.search = new URLSearchParams(params).toString();
            const response = await fetch(url, {signal:AbortSignal.timeout(20000)});
            if (!response.ok) throw Error('Music request failed');
            const body = await response.json();
            if (body.code !== 200) throw Error('Music API error');
            return body;
          };
          const playlist = await request('/playlist/detail', {id:config.playlistId});
          const ids = playlist.playlist?.trackIds?.map(track => track.id);
          if (!ids?.length) throw Error('Empty playlist');
          // Show metadata without waiting for the slower audio URL request.
          const audioPromise = request('/song/url', {id:ids.join(','), br:128000}).catch(() => null);
          const details = await request('/song/detail', {ids:ids.join(',')});
          const songs = new Map((details.songs || []).map(track => [String(track.id), track]));
          const https = value => {
            try { const url = new URL(value); if (!['http:','https:'].includes(url.protocol)) return ''; url.protocol = 'https:'; return url.href; } catch (_) { return ''; }
          };
          const tracks = ids.map(id => {
            const song = songs.get(String(id));
            return {name:escape(song?.name || '歌曲 ' + id), artist:escape((song?.ar || []).map(artist => artist.name).join(' / ')), url:'', type:'unavailable', pending:true, cover:https(song?.al?.picUrl)};
          });
          player.list.clear(); player.list.add(tracks);
          const audio = await audioPromise;
          const urls = new Map((audio?.data || []).map(track => [String(track.id), track]));
          player.list.audios.forEach((track, index) => {
            const result = urls.get(String(ids[index]));
            track.url = https(result?.url); track.pending = false;
            track.type = track.url ? 'normal' : 'unavailable';
            const label = !audio ? '（音源加载失败）' : !track.url ? '（暂不可播）' : result.freeTrialInfo ? '（试听）' : '';
            const name = (songs.get(String(ids[index]))?.name || '歌曲 ' + ids[index]) + label;
            track.name = escape(name);
            player.template.listOl.children[index].querySelector('.aplayer-list-title').textContent = name;
          });
          const firstPlayable = player.list.audios.findIndex(track => track.url);
          player.list.switch(firstPlayable >= 0 ? firstPlayable : 0);
          if (!audio) player.notice('音源加载失败，请刷新重试；歌单已保留', 5000);
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
