const now = new Date();
console.log('Current Full Date:', now.toString());
console.log('Current ISO Date:', now.toISOString());
console.log('Current Hours:', now.getHours());
console.log('Current Minutes:', now.getMinutes());

const tenMinutesLater = new Date(now.getTime() + 10 * 60000);
console.log('10 Mins Later Hours:', tenMinutesLater.getHours());
console.log('10 Mins Later Minutes:', tenMinutesLater.getMinutes());
