const puppeteer = require('puppeteer');
const html2json = require('html2json').html2json;
const SANTANDER_LOGIN = ``;
const SANTANDER_PRIVATE_SITE = ``;

(async () => {
  /* Initiate the Puppeteer browser */
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(SANTANDER_LOGIN, {waitUntil: 'networkidle0'});
  await page.waitFor(500);

  await page.type('[formcontrolname=rut]', '');
  await page.type('[formcontrolname=pass]', '');

  await page.click('[type=submit]');
  await page.waitForNavigation();
  await page.goto(SANTANDER_PRIVATE_SITE, {waitUntil: 'networkidle0'});
  await page.waitForSelector('.onboardingContainer', {visible: true});
  await page.evaluate(e => {
    let onb = document.querySelector('.onboardingContainer');
     onb.style.display = 'none';
  });


  await page.click('.newProduct:last-child .contentLeft');
  await page.waitForSelector('.movimiento', {visible: true});
  await page.waitForSelector('.container-pills.tresBotones li:nth-child(2) button', {visible: true});
  await page.click('.container-pills.tresBotones li:nth-child(2) button');
  await page.waitFor(50);

  const mov = await page.$$eval('.movimiento', e => {
    let inner = [];
    e.forEach( ht => {
      let p_inner = [];
      const nombre = ht.querySelector(".movimiento--nombre").innerHTML;
      const monto = ht.querySelector(".movimiento--monto").innerHTML;
      let saldo  = ht.querySelector(".movimiento--saldo").innerHTML;
      ht.querySelectorAll(".contenido-movimientos--item--info div:not(.borde) p").forEach( p => {
        p_inner.push(p.innerHTML);
      });
      saldo = saldo.replace('\n                                            ','');
      saldo = saldo.replace('<span class="movimiento--label">Saldo: </span>+$', '');
      const rut = nombre.split(' transf. ');
      let info = {
        "rut": rut[0].replace(' ',''),
        "name": rut[1].replace('  ',''),
        "type" : monto.charAt(0) === '+' ? 'in' :  monto.charAt(0) === '-' ? 'out' : ' ',
        "ammount": monto.substr(1).replace('$',''),
        "balance": saldo,
        "info": p_inner[0],
        "date": p_inner[1],
        "transaction_number":p_inner[2]
      };
      inner.push(info);
    });
    return inner;
  });

  console.log(mov);
  await browser.close();
})();
