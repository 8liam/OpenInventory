import { APPLE_SILICON_RENDERER, DEFAULT_PLATFORM } from './download.config';
import type { DetectedPlatform } from './download.types';

type UAData = { platform?: string; getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }> };

const hasAppleSiliconGpu = (): boolean => {
  const gl = document.createElement('canvas').getContext('webgl');
  const ext = gl?.getExtension('WEBGL_debug_renderer_info');
  const renderer = gl && ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
  return APPLE_SILICON_RENDERER.test(renderer);
};

async function detectMac(uaData: UAData | undefined): Promise<DetectedPlatform> {
  // Chromium reports the CPU architecture directly.
  const arch = (await uaData?.getHighEntropyValues?.(['architecture']))?.architecture;
  if (arch) return arch === 'arm' ? 'mac-arm64' : 'mac-x64';
  // Safari and Firefox freeze the UA to "Intel", so read the GPU; if that is hidden too, assume the common case.
  try { return hasAppleSiliconGpu() ? 'mac-arm64' : 'mac-x64'; } catch { return DEFAULT_PLATFORM; }
}

/** Resolves to the desktop build for this browser's OS, or null on phones, tablets and unknown systems. */
export async function detectPlatform(): Promise<DetectedPlatform> {
  const uaData = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;
  const ua = navigator.userAgent;
  if (/android|iphone|ipad|ipod|cros/i.test(ua) || (navigator.maxTouchPoints > 1 && /macintosh/i.test(ua))) return null;
  const os = (uaData?.platform ?? navigator.platform ?? '').toLowerCase();
  if (/win/.test(os) || /windows/i.test(ua)) return 'win-x64';
  if (/mac/.test(os) || /macintosh/i.test(ua)) return detectMac(uaData);
  if (/linux|x11/.test(os) || /linux|x11/i.test(ua)) return 'linux-x64';
  return null;
}
