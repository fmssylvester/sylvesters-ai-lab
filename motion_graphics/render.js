#!/usr/bin/env node
/**
 * Motion Graphics Renderer
 * Renders HTML + GSAP animations to MP4 using Puppeteer + FFmpeg
 */

const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'index.html');
const OUTPUT_DIR = path.join(__dirname, 'frames');
const OUTPUT_VIDEO = path.join(__dirname, '..', 'out', 'motion_graphics.mp4');

const FPS = 30;
const DURATION = 19; // seconds
const WIDTH = 1920;
const HEIGHT = 1080;

async function render() {
  console.log('Starting motion graphics render...');
  
  // Create frames directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });
  
  // Load HTML
  await page.goto(`file://${HTML_FILE}`, { waitUntil: 'networkidle0' });
  
  // Wait for GSAP to load
  await page.waitForFunction('window.gsap !== undefined');
  
  console.log(`Capturing ${FPS * DURATION} frames...`);
  
  // Capture frames
  for (let frame = 0; frame < FPS * DURATION; frame++) {
    const time = frame / FPS;
    
    // Seek GSAP timeline
    await page.evaluate((t) => {
      const tl = window.__timelines['motion-demo'];
      if (tl) {
        tl.seek(t);
      }
    }, time);
    
    // Wait for render
    await new Promise(r => setTimeout(r, 50));
    
    // Capture frame
    const frameNum = String(frame).padStart(5, '0');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `frame_${frameNum}.png`),
      type: 'png'
    });
    
    if (frame % 30 === 0) {
      console.log(`  Frame ${frame}/${FPS * DURATION} (${time.toFixed(1)}s)`);
    }
  }
  
  await browser.close();
  
  // Stitch frames to video with FFmpeg
  console.log('Encoding video...');
  execSync(`ffmpeg -y -framerate ${FPS} -i ${OUTPUT_DIR}/frame_%05d.png -c:v libx264 -crf 18 -pix_fmt yuv420p ${OUTPUT_VIDEO}`, {
    stdio: 'inherit'
  });
  
  // Cleanup frames
  fs.rmSync(OUTPUT_DIR, { recursive: true });
  
  console.log(`\nDone! Video saved to: ${OUTPUT_VIDEO}`);
}

render().catch(console.error);
