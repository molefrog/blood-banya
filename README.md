<p align="center">
<img src="https://raw.githubusercontent.com/molefrog/blood-banya/master/logo/blood-banya@2x.png" width="340px" />
</p>

## Spooky!
I was tired of installing Phantom/Nightmare/etc everytime I needed a page screenshot feature for my 12-factor apps. The 
**Blood Banya** is a dummy screenshot service that uses pool of Nightmare.js renderers to increase the rendering speed.
It can be self hosted. 

## Seting up Blood Banya on a hosted server
First, make sure your server has decent amount of swap enabled. Fresh servers usually come without any swap and 
it's really easy to forget to enable swap in a first place, which sometimes leads to hours of trying to figure
out why `npm install` crashes. [This DO article](https://www.digitalocean.com/community/tutorials/how-to-add-swap-on-ubuntu-14-04) is a life saver!

**Blood Banya** uses Nightmare.js which is powered by Electron, so first thing you have to install is X11 framebuffer:
```bash
apt-get update &&\
    apt-get install -y libgtk2.0-0 libgconf-2-4 \
    libasound2 libxtst6 libxss1 libnss3 xvfb

# Launch framebuffer virtual display
Xvfb -ac -screen scrn 1280x2000x24 :9.0 &
```

Now launch **Blood Banya**:
```
npm install
DISPLAY=:9.0 PORT=80 NODE_ENV=production node --harmony index.js
# or if you prefer pm2:
DISPLAY=:9.0 PORT=80 pm2 start index.js —node-args='--harmony'
```

Stay tuned for more info! 🎃💀
