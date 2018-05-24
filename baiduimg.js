var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var request = require('request');
var https = require('https');
var fs = require("fs");

var aUrls = [];
var index = 0;

function main(word) {
  var baseUrl1 = 'https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&ct=201326592&is=&fp=result&queryWord=%E6%A8%B1%E8%8A%B1&cl=&lm=-1&ie=utf-8&oe=utf-8&adpicid=&st=&z=&ic=0&word=';
  var baseUrl2 = '&s=&se=&tab=&width=0&height=0&face=&istype=&qc=&nc=&fr=&pn=30&rn=';
  var baseUrl3 = '&gsm=1e&';
  var urlcodeWord = encodeURIComponent(word);
  var t1 = new Date().getTime();
  var url = baseUrl1 + urlcodeWord + baseUrl2 + '30' + baseUrl3 + t1 + '+';
  getContent(url);
}

function getContent(url) {
  https.get(url, function(sres) {
    var chunks = [];
    sres.on('data', function(chunk) {
      chunks.push(chunk);
    });
    sres.on('end', function() {
      var html = iconv.decode(Buffer.concat(chunks), 'utf8');
      var data = JSON.parse(html);
      for (var i in data.data) {
        if (data.data[i].middleURL === undefined || data.data[i].di === undefined || data.data[i].type === undefined ) {
          // 
        } else {
          aUrls.push({
            url: data.data[i].middleURL,
            filename: data.data[i].di + "." + data.data[i].type
          })
        }        
      }
      getImg()      
    });
  })
}


function getImg() {
  var imgurl = aUrls[index].url;
  var imgfile = aUrls[index].filename;
  request.head(imgurl, function(error, res,body){
    if(error){
      console.log('失败了')
    }
  });
  //通过管道的方式用fs模块将图片写到本地的images文件下
  request(imgurl).pipe(fs.createWriteStream('./images/' + imgfile));
  if (index < aUrls.length - 1) {
    index++;
    getImg()
  } else {
    console.log('结束！');
  }
}

main('江西');