(function(){
  try {
    // Pega o parâmetro source (case insensitive)
    const p = new URLSearchParams(window.location.search).get('source');
    if(!p || p.toLowerCase() !== 'tiktok') return;

    // URL do endpoint que entrega configs - aqui pode ser trocado por sua API real
    const configURL = 'https://dynamic-lac.vercel.app/config.json';

    fetch(configURL)
      .then(res => res.json())
      .then(cfg => {
        // cfg.blackPage e cfg.whitePage são strings HTML

        // Injetar blackPage no body (exemplo)
        if(cfg.blackPage){
          const divBlack = document.createElement('div');
          divBlack.innerHTML = cfg.blackPage;
          document.body.appendChild(divBlack);
        }

        // Opcional: injetar whitePage em outro lugar, ex:
        if(cfg.whitePage){
          const divWhite = document.createElement('div');
          divWhite.innerHTML = cfg.whitePage;
          document.body.appendChild(divWhite);
        }
      })
      .catch(()=>{ /* fail silencioso */ });
  } catch(e) { /* fail silencioso */ }
})();
