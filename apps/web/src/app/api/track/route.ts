import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

// ─── UA parsing helpers ────────────────────────────────────────────────────

function detectDevice(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/tablet|ipad|playbook|silk|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectBrowser(ua: string): { browser: string; version: string } {
  const tests: [RegExp, string][] = [
    [/Edg\/([\d.]+)/i,     'Edge'],
    [/OPR\/([\d.]+)/i,     'Opera'],
    [/SamsungBrowser\/([\d.]+)/i, 'Samsung'],
    [/Chrome\/([\d.]+)/i,  'Chrome'],
    [/Firefox\/([\d.]+)/i, 'Firefox'],
    [/Version\/([\d.]+).*Safari/i, 'Safari'],
    [/MSIE ([\d.]+)/i,     'IE'],
    [/Trident.*rv:([\d.]+)/i, 'IE'],
  ];
  for (const [re, name] of tests) {
    const m = ua.match(re);
    if (m) return { browser: name, version: m[1] ?? '' };
  }
  return { browser: 'Other', version: '' };
}

function detectOS(ua: string): { os: string; version: string } {
  const tests: [RegExp, string][] = [
    [/Windows NT ([\d.]+)/i, 'Windows'],
    [/Mac OS X ([\d_.]+)/i,  'macOS'],
    [/iPhone OS ([\d_]+)/i,  'iOS'],
    [/iPad.*OS ([\d_]+)/i,   'iPadOS'],
    [/Android ([\d.]+)/i,    'Android'],
    [/Linux/i,               'Linux'],
    [/CrOS/i,                'ChromeOS'],
  ];
  for (const [re, name] of tests) {
    const m = ua.match(re);
    if (m) return { os: name, version: (m[1] ?? '').replace(/_/g, '.') };
  }
  return { os: 'Other', version: '' };
}

// ─── IP extraction ─────────────────────────────────────────────────────────

function extractIP(req: NextRequest): string | null {
  // Vercel provides the real client IP in this header (most reliable)
  return (
    req.headers.get('x-vercel-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null
  );
}

/**
 * Hash the IP rather than storing it.
 *
 * A raw address is personal data under GDPR/CCPA and this app has no consent
 * mechanism. The salted hash still distinguishes visitors and supports abuse
 * detection, while country/region/city below keep the geo analytics intact.
 * Returns null when no salt is configured so a misconfiguration cannot
 * silently degrade into storing an unsalted (reversible) hash.
 */
function hashIP(ip: string | null): string | null {
  const salt = process.env.ANALYTICS_IP_SALT;
  if (!ip || !salt) return null;
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      session_id:      string;
      user_id?:        string | null;
      event_type:      string;
      page?:           string;
      referrer?:       string;
      screen_width?:   number;
      screen_height?:  number;
      viewport_width?: number;
      viewport_height?:number;
      device_pixel_ratio?: number;
      language?:       string;
      timezone?:       string;
      properties?:     Record<string, unknown>;
    };

    const ua      = req.headers.get('user-agent') ?? '';
    const ip      = extractIP(req);
    const country = req.headers.get('x-vercel-ip-country') ?? null;
    const region  = req.headers.get('x-vercel-ip-country-region') ?? null;
    const city    = req.headers.get('x-vercel-ip-city') ?? null;

    const deviceType = detectDevice(ua);
    const { browser, version: browserVersion } = detectBrowser(ua);
    const { os, version: osVersion }           = detectOS(ua);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { error } = await supabase.from('analytics_events').insert({
      session_id:         body.session_id,
      user_id:            body.user_id ?? null,
      event_type:         body.event_type,
      page:               body.page ?? null,
      referrer:           body.referrer ?? null,
      ip_hash:            hashIP(ip),
      country:            country,
      region:             region,
      city:               city,
      user_agent:         ua || null,
      device_type:        deviceType,
      browser:            browser,
      browser_version:    browserVersion || null,
      os:                 os,
      os_version:         osVersion || null,
      screen_width:       body.screen_width  ?? null,
      screen_height:      body.screen_height ?? null,
      viewport_width:     body.viewport_width  ?? null,
      viewport_height:    body.viewport_height ?? null,
      device_pixel_ratio: body.device_pixel_ratio ?? null,
      language:           body.language  ?? null,
      timezone:           body.timezone  ?? null,
      properties:         body.properties ?? null,
    });

    if (error) {
      console.error('[analytics] insert error', error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[analytics] route error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
