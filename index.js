const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client();
const {token} = require('./secrets/token.json')
client.dialog = require("./memory/dialog.json");
client.keywords = require("./memory/keywords.json");
client.analisis = require("./memory/analisis.json");
client.screening = require('./memory/screening.json')

//happens when the code is on
client.once("ready", () => {

    //gets new phrases that recieved awnsers and save it
    for (let i = 0; i < client.screening.length; i++) {
        if(client.screening[i].ready == true && client.screening[i].awnsers.length >= 2){
            const rising = [
                client.screening[i].keywords,
                client.screening[i].awnsers
            ]
            client.dialog.push(rising)
            client.screening.splice(i,1)
        }
    }

  //adds all the keywords to keyword database
  for (let i = 0; i < client.dialog.length; i++) {
    for (let j = 0; j < client.dialog[i][0].length; j++) {
      if (!client.keywords.includes(client.dialog[i][0][j])) {
        client.keywords.push(client.dialog[i][0][j]);
      }
    }
  }
  fs.writeFile(
    "./memory/keywords.json",
    JSON.stringify(client.keywords),
    (error) => {
      if (error) console.log(error);
    }
  );
fs.writeFile(
    "./memory/dialog.json",
    JSON.stringify(client.dialog),
    (error) => {
      if (error) console.log(error);
    }
  );
  fs.writeFile(
      "./memory/screening.json",
      JSON.stringify(client.screening),
      (error) => {
        if (error) console.log(error);
      }
    );
  console.log("ready");
});

client.on("message", (message) => {
  if (message.author.bot) return;
  //javascript object to save all the information about the message
  var reading = {
    content: message.content.toLowerCase().split(/ +/),
    keywords: [],
    awnser: "",
  };

  for (let i = 0; i < client.keywords.length; i++) {
    if (reading.content.includes(client.keywords[i])) {
      reading.keywords.push(client.keywords[i]);
    }
  }
  for (let i = 0; i < client.dialog.length; i++) {
    if (client.dialog[i][0].join(' ') == reading.keywords.join(' ')) {
      reading.awnser = client.dialog[i][1][Math.floor(Math.random() * client.dialog[i][1].length)
        ];
    }
  }
//separating the phrases that do not have awnser to analisis
  if (reading.awnser == "") {
    var existent = false;
    for (let i = 0; i < client.analisis.length; i++) {
      if (client.analisis[i].keywords.join(' ') == reading.content.join(' ')) {
        existent = true;
        if(client.analisis[i].appearances == 5){
            const screened = {
                keywords: reading.content,
                awnsers:[],
                ready: false
            }
            client.screening.push(screened)
        }
        client.analisis[i].appearances++;
      }
    }
    if (existent == false) {
      const send = {
        keywords: reading.content,
        awnsers: [],
        appearances: 1,
      };
      client.analisis.push(send)
    }
  }else{
      message.channel.send(reading.awnser)
  }
  fs.writeFile(
    "./memory/analisis.json",
    JSON.stringify(client.analisis),
    (error) => {
      if (error) console.log(error);
    }
  );
  fs.writeFile(
    "./memory/screening.json",
    JSON.stringify(client.screening),
    (error) => {
      if (error) console.log(error);
    }
  );
});

client.login(token);
