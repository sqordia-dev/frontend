import type { CreateEmailTemplateRequest } from './email-template-service';

/* ─── Email logo: brain icon on strategy-blue background (PNG hosted) ──── */

const EMAIL_LOGO_URL = 'https://sqordia.app/images/email-logo.png';

/* ─── Shared HTML shell ───────────────────────────────────────────────── */

function wrap(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Sqordia</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#1C1D1A 0%,#0f1a2e 100%);padding:32px 40px;text-align:center;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
  <tr>
    <td style="vertical-align:middle;">
      <img src="${EMAIL_LOGO_URL}" width="36" height="36" alt="Sqordia" style="display:block;border-radius:10px;" />
    </td>
    <td style="padding-left:12px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      Sqordia
    </td>
  </tr>
  </table>
</td>
</tr>
<!-- Body -->
<tr>
<td style="padding:40px;">
${inner}
</td>
</tr>
<!-- Footer -->
<tr>
<td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="font-size:12px;color:#9ca3af;line-height:1.6;">
      <p style="margin:0;">Sqordia Inc. &middot; Montr&eacute;al, QC, Canada</p>
      <p style="margin:4px 0 0;">
        <a href="{{unsubscribeUrl}}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
        &nbsp;&middot;&nbsp;
        <a href="https://sqordia.app/privacy" style="color:#9ca3af;text-decoration:underline;">Privacy Policy</a>
      </p>
    </td>
  </tr>
  </table>
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function wrapFr(inner: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Sqordia</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#1C1D1A 0%,#0f1a2e 100%);padding:32px 40px;text-align:center;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
  <tr>
    <td style="vertical-align:middle;">
      <img src="${EMAIL_LOGO_URL}" width="36" height="36" alt="Sqordia" style="display:block;border-radius:10px;" />
    </td>
    <td style="padding-left:12px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      Sqordia
    </td>
  </tr>
  </table>
</td>
</tr>
<!-- Body -->
<tr>
<td style="padding:40px;">
${inner}
</td>
</tr>
<!-- Footer -->
<tr>
<td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="font-size:12px;color:#9ca3af;line-height:1.6;">
      <p style="margin:0;">Sqordia Inc. &middot; Montr&eacute;al, QC, Canada</p>
      <p style="margin:4px 0 0;">
        <a href="{{unsubscribeUrl}}" style="color:#9ca3af;text-decoration:underline;">Se d&eacute;sabonner</a>
        &nbsp;&middot;&nbsp;
        <a href="https://sqordia.app/privacy" style="color:#9ca3af;text-decoration:underline;">Politique de confidentialit&eacute;</a>
      </p>
    </td>
  </tr>
  </table>
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ─── CTA button helper ───────────────────────────────────────────────── */

function cta(label: string, url: string = '{{actionUrl}}'): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
<tr>
<td style="border-radius:8px;background-color:#FF6B00;">
  <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${label}</a>
</td>
</tr>
</table>`;
}

/* ─── Inline styles ───────────────────────────────────────────────────── */

const h1 = 'style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1C1D1A;line-height:1.3;"';
const p  = 'style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.6;"';
const small = 'style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;"';
const divider = '<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />';
const listItem = 'style="margin:0 0 8px;font-size:15px;color:#4b5563;line-height:1.6;"';

/* ═══════════════════════════════════════════════════════════════════════
   1. AUTH — Welcome Email
   ═══════════════════════════════════════════════════════════════════════ */

const authEn = wrap(`
<h1 ${h1}>Welcome to Sqordia, {{firstName}}!</h1>
<p ${p}>We're excited to have you on board. Sqordia is your all-in-one platform for creating professional, bank-ready business plans.</p>
<p ${p}>Here's what you can do next:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
  <tr><td ${listItem}>&bull;&nbsp; Complete your profile and organization setup</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; Start your first business plan with guided questionnaires</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; Explore AI-powered content generation</td></tr>
</table>
${cta('Get Started')}
<p ${p}>If you have any questions, our support team is here to help.</p>
${divider}
<p ${small}>You're receiving this email because you signed up for Sqordia with {{email}}.</p>
`);

const authFr = wrapFr(`
<h1 ${h1}>Bienvenue sur Sqordia, {{firstName}}&nbsp;!</h1>
<p ${p}>Nous sommes ravis de vous accueillir. Sqordia est votre plateforme tout-en-un pour cr&eacute;er des plans d'affaires professionnels, pr&ecirc;ts pour les banques.</p>
<p ${p}>Voici ce que vous pouvez faire ensuite&nbsp;:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
  <tr><td ${listItem}>&bull;&nbsp; Compl&eacute;ter votre profil et configurer votre organisation</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; D&eacute;marrer votre premier plan d'affaires avec nos questionnaires guid&eacute;s</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; Explorer la g&eacute;n&eacute;ration de contenu assist&eacute;e par IA</td></tr>
</table>
${cta('Commencer')}
<p ${p}>Si vous avez des questions, notre &eacute;quipe de soutien est l&agrave; pour vous aider.</p>
${divider}
<p ${small}>Vous recevez ce courriel parce que vous vous &ecirc;tes inscrit(e) sur Sqordia avec {{email}}.</p>
`);

/* ═══════════════════════════════════════════════════════════════════════
   2. NOTIFICATION — Plan Shared
   ═══════════════════════════════════════════════════════════════════════ */

const notificationEn = wrap(`
<h1 ${h1}>A business plan has been shared with you</h1>
<p ${p}>Hi {{firstName}},</p>
<p ${p}><strong>{{senderName}}</strong> has shared the business plan <strong>&ldquo;{{planName}}&rdquo;</strong> with you on Sqordia.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
<tr>
<td style="background-color:#f4f7fa;border-radius:8px;padding:20px;">
  <table role="presentation" cellpadding="0" cellspacing="0">
    <tr><td style="font-size:13px;color:#9ca3af;padding-bottom:4px;">Plan</td></tr>
    <tr><td style="font-size:15px;font-weight:600;color:#1C1D1A;padding-bottom:12px;">{{planName}}</td></tr>
    <tr><td style="font-size:13px;color:#9ca3af;padding-bottom:4px;">Shared by</td></tr>
    <tr><td style="font-size:15px;color:#4b5563;">{{senderName}} ({{senderEmail}})</td></tr>
  </table>
</td>
</tr>
</table>
${cta('View Business Plan')}
<p ${p}>You can view and collaborate on this plan at any time from your dashboard.</p>
${divider}
<p ${small}>This is an automated notification from Sqordia. If you believe this was sent in error, please ignore this email.</p>
`);

const notificationFr = wrapFr(`
<h1 ${h1}>Un plan d'affaires a &eacute;t&eacute; partag&eacute; avec vous</h1>
<p ${p}>Bonjour {{firstName}},</p>
<p ${p}><strong>{{senderName}}</strong> a partag&eacute; le plan d'affaires <strong>&laquo;&nbsp;{{planName}}&nbsp;&raquo;</strong> avec vous sur Sqordia.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
<tr>
<td style="background-color:#f4f7fa;border-radius:8px;padding:20px;">
  <table role="presentation" cellpadding="0" cellspacing="0">
    <tr><td style="font-size:13px;color:#9ca3af;padding-bottom:4px;">Plan</td></tr>
    <tr><td style="font-size:15px;font-weight:600;color:#1C1D1A;padding-bottom:12px;">{{planName}}</td></tr>
    <tr><td style="font-size:13px;color:#9ca3af;padding-bottom:4px;">Partag&eacute; par</td></tr>
    <tr><td style="font-size:15px;color:#4b5563;">{{senderName}} ({{senderEmail}})</td></tr>
  </table>
</td>
</tr>
</table>
${cta('Voir le plan d\'affaires')}
<p ${p}>Vous pouvez consulter et collaborer sur ce plan &agrave; tout moment depuis votre tableau de bord.</p>
${divider}
<p ${small}>Ceci est une notification automatique de Sqordia. Si vous pensez que ce courriel vous a &eacute;t&eacute; envoy&eacute; par erreur, veuillez l'ignorer.</p>
`);

/* ═══════════════════════════════════════════════════════════════════════
   3. MARKETING — Feature Announcement
   ═══════════════════════════════════════════════════════════════════════ */

const marketingEn = wrap(`
<h1 ${h1}>Introducing {{featureName}}</h1>
<p ${p}>Hi {{firstName}},</p>
<p ${p}>We're thrilled to announce a powerful new feature that makes your business planning even easier.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
<tr>
<td style="background:linear-gradient(135deg,#FFF7ED 0%,#FEF3C7 100%);border-radius:8px;padding:24px;border-left:4px solid #FF6B00;">
  <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1C1D1A;">{{featureName}}</h2>
  <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.6;">{{featureDescription}}</p>
</td>
</tr>
</table>
<p ${p}><strong>What's new:</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
  <tr><td ${listItem}>&bull;&nbsp; {{benefit1}}</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; {{benefit2}}</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; {{benefit3}}</td></tr>
</table>
${cta('Try It Now')}
<p ${p}>As always, we'd love to hear your feedback. Reply to this email or reach out to our support team.</p>
`);

const marketingFr = wrapFr(`
<h1 ${h1}>D&eacute;couvrez {{featureName}}</h1>
<p ${p}>Bonjour {{firstName}},</p>
<p ${p}>Nous sommes ravis de vous pr&eacute;senter une nouvelle fonctionnalit&eacute; qui rend votre planification d'affaires encore plus facile.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
<tr>
<td style="background:linear-gradient(135deg,#FFF7ED 0%,#FEF3C7 100%);border-radius:8px;padding:24px;border-left:4px solid #FF6B00;">
  <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1C1D1A;">{{featureName}}</h2>
  <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.6;">{{featureDescription}}</p>
</td>
</tr>
</table>
<p ${p}><strong>Quoi de neuf&nbsp;:</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
  <tr><td ${listItem}>&bull;&nbsp; {{benefit1}}</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; {{benefit2}}</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; {{benefit3}}</td></tr>
</table>
${cta('Essayer maintenant')}
<p ${p}>Comme toujours, nous serions ravis de recevoir vos commentaires. R&eacute;pondez &agrave; ce courriel ou contactez notre &eacute;quipe de soutien.</p>
`);

/* ═══════════════════════════════════════════════════════════════════════
   4. BILLING — Payment Confirmation
   ═══════════════════════════════════════════════════════════════════════ */

const billingEn = wrap(`
<h1 ${h1}>Payment Confirmed</h1>
<p ${p}>Hi {{firstName}},</p>
<p ${p}>Thank you for your payment. Here's your receipt:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
<tr>
<td style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr style="background-color:#f9fafb;">
      <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#6b7280;">Description</td>
      <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#6b7280;text-align:right;">Amount</td>
    </tr>
    <tr>
      <td style="padding:16px 20px;font-size:15px;color:#1C1D1A;border-top:1px solid #e5e7eb;">{{planDescription}}</td>
      <td style="padding:16px 20px;font-size:15px;color:#1C1D1A;border-top:1px solid #e5e7eb;text-align:right;">{{amount}}</td>
    </tr>
    <tr style="background-color:#f9fafb;">
      <td style="padding:12px 20px;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">Tax</td>
      <td style="padding:12px 20px;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;text-align:right;">{{taxAmount}}</td>
    </tr>
    <tr>
      <td style="padding:16px 20px;font-size:16px;font-weight:700;color:#1C1D1A;border-top:2px solid #e5e7eb;">Total</td>
      <td style="padding:16px 20px;font-size:16px;font-weight:700;color:#FF6B00;border-top:2px solid #e5e7eb;text-align:right;">{{totalAmount}}</td>
    </tr>
  </table>
</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
  <tr><td ${listItem}><strong>Invoice #:</strong> {{invoiceNumber}}</td></tr>
  <tr><td ${listItem}><strong>Date:</strong> {{paymentDate}}</td></tr>
  <tr><td ${listItem}><strong>Payment method:</strong> {{paymentMethod}}</td></tr>
</table>
${cta('View Invoice', '{{invoiceUrl}}')}
<p ${p}>If you have any questions about this charge, please contact our billing support.</p>
${divider}
<p ${small}>This receipt was sent to {{email}}. Keep it for your records.</p>
`);

const billingFr = wrapFr(`
<h1 ${h1}>Paiement confirm&eacute;</h1>
<p ${p}>Bonjour {{firstName}},</p>
<p ${p}>Merci pour votre paiement. Voici votre re&ccedil;u&nbsp;:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
<tr>
<td style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr style="background-color:#f9fafb;">
      <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#6b7280;">Description</td>
      <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#6b7280;text-align:right;">Montant</td>
    </tr>
    <tr>
      <td style="padding:16px 20px;font-size:15px;color:#1C1D1A;border-top:1px solid #e5e7eb;">{{planDescription}}</td>
      <td style="padding:16px 20px;font-size:15px;color:#1C1D1A;border-top:1px solid #e5e7eb;text-align:right;">{{amount}}</td>
    </tr>
    <tr style="background-color:#f9fafb;">
      <td style="padding:12px 20px;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">Taxes</td>
      <td style="padding:12px 20px;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;text-align:right;">{{taxAmount}}</td>
    </tr>
    <tr>
      <td style="padding:16px 20px;font-size:16px;font-weight:700;color:#1C1D1A;border-top:2px solid #e5e7eb;">Total</td>
      <td style="padding:16px 20px;font-size:16px;font-weight:700;color:#FF6B00;border-top:2px solid #e5e7eb;text-align:right;">{{totalAmount}}</td>
    </tr>
  </table>
</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
  <tr><td ${listItem}><strong>Facture n&deg;&nbsp;:</strong> {{invoiceNumber}}</td></tr>
  <tr><td ${listItem}><strong>Date&nbsp;:</strong> {{paymentDate}}</td></tr>
  <tr><td ${listItem}><strong>Mode de paiement&nbsp;:</strong> {{paymentMethod}}</td></tr>
</table>
${cta('Voir la facture', '{{invoiceUrl}}')}
<p ${p}>Si vous avez des questions concernant ce paiement, veuillez contacter notre soutien facturation.</p>
${divider}
<p ${small}>Ce re&ccedil;u a &eacute;t&eacute; envoy&eacute; &agrave; {{email}}. Conservez-le pour vos dossiers.</p>
`);

/* ═══════════════════════════════════════════════════════════════════════
   5. SYSTEM — Scheduled Maintenance
   ═══════════════════════════════════════════════════════════════════════ */

const systemEn = wrap(`
<h1 ${h1}>Scheduled Maintenance Notice</h1>
<p ${p}>Hi {{firstName}},</p>
<p ${p}>We're writing to let you know about upcoming scheduled maintenance on the Sqordia platform.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
<tr>
<td style="background-color:#FEF3C7;border-radius:8px;padding:20px;border-left:4px solid #F59E0B;">
  <table role="presentation" cellpadding="0" cellspacing="0">
    <tr><td style="font-size:13px;font-weight:600;color:#92400E;padding-bottom:12px;">MAINTENANCE WINDOW</td></tr>
    <tr><td style="font-size:15px;color:#78350F;padding-bottom:8px;"><strong>Date:</strong> {{maintenanceDate}}</td></tr>
    <tr><td style="font-size:15px;color:#78350F;padding-bottom:8px;"><strong>Time:</strong> {{maintenanceTime}} (Eastern Time)</td></tr>
    <tr><td style="font-size:15px;color:#78350F;"><strong>Expected duration:</strong> {{maintenanceDuration}}</td></tr>
  </table>
</td>
</tr>
</table>
<p ${p}><strong>What to expect:</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
  <tr><td ${listItem}>&bull;&nbsp; The platform may be temporarily unavailable during this window</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; All your data is safe and will not be affected</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; Any unsaved work should be saved before the maintenance begins</td></tr>
</table>
<p ${p}>We recommend saving your work before the maintenance window begins. We apologize for any inconvenience and appreciate your patience.</p>
${cta('Check System Status', '{{statusPageUrl}}')}
${divider}
<p ${small}>This is a system notification sent to all active Sqordia users. No action is required on your part unless stated above.</p>
`);

const systemFr = wrapFr(`
<h1 ${h1}>Avis de maintenance planifi&eacute;e</h1>
<p ${p}>Bonjour {{firstName}},</p>
<p ${p}>Nous vous &eacute;crivons pour vous informer d'une maintenance planifi&eacute;e sur la plateforme Sqordia.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
<tr>
<td style="background-color:#FEF3C7;border-radius:8px;padding:20px;border-left:4px solid #F59E0B;">
  <table role="presentation" cellpadding="0" cellspacing="0">
    <tr><td style="font-size:13px;font-weight:600;color:#92400E;padding-bottom:12px;">FEN&Ecirc;TRE DE MAINTENANCE</td></tr>
    <tr><td style="font-size:15px;color:#78350F;padding-bottom:8px;"><strong>Date&nbsp;:</strong> {{maintenanceDate}}</td></tr>
    <tr><td style="font-size:15px;color:#78350F;padding-bottom:8px;"><strong>Heure&nbsp;:</strong> {{maintenanceTime}} (heure de l'Est)</td></tr>
    <tr><td style="font-size:15px;color:#78350F;"><strong>Dur&eacute;e pr&eacute;vue&nbsp;:</strong> {{maintenanceDuration}}</td></tr>
  </table>
</td>
</tr>
</table>
<p ${p}><strong>&Agrave; quoi s'attendre&nbsp;:</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
  <tr><td ${listItem}>&bull;&nbsp; La plateforme pourrait &ecirc;tre temporairement indisponible pendant cette p&eacute;riode</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; Toutes vos donn&eacute;es sont en s&eacute;curit&eacute; et ne seront pas affect&eacute;es</td></tr>
  <tr><td ${listItem}>&bull;&nbsp; Tout travail non sauvegard&eacute; devrait &ecirc;tre enregistr&eacute; avant le d&eacute;but de la maintenance</td></tr>
</table>
<p ${p}>Nous vous recommandons de sauvegarder votre travail avant le d&eacute;but de la maintenance. Nous nous excusons pour tout inconv&eacute;nient et appr&eacute;cions votre patience.</p>
${cta('V&eacute;rifier l\'&eacute;tat du syst&egrave;me', '{{statusPageUrl}}')}
${divider}
<p ${small}>Ceci est une notification syst&egrave;me envoy&eacute;e &agrave; tous les utilisateurs actifs de Sqordia. Aucune action n'est requise de votre part sauf indication contraire ci-dessus.</p>
`);

/* ═══════════════════════════════════════════════════════════════════════
   Export
   ═══════════════════════════════════════════════════════════════════════ */

export const STARTER_TEMPLATES: CreateEmailTemplateRequest[] = [
  {
    name: 'welcome_email',
    category: 'auth',
    subjectEn: 'Welcome to Sqordia, {{firstName}}!',
    subjectFr: 'Bienvenue sur Sqordia, {{firstName}} !',
    bodyEn: authEn,
    bodyFr: authFr,
    variablesJson: '["firstName","lastName","email","actionUrl","unsubscribeUrl"]',
  },
  {
    name: 'plan_shared',
    category: 'notification',
    subjectEn: '{{senderName}} shared a business plan with you',
    subjectFr: '{{senderName}} a partagé un plan d\'affaires avec vous',
    bodyEn: notificationEn,
    bodyFr: notificationFr,
    variablesJson: '["firstName","senderName","senderEmail","planName","actionUrl","unsubscribeUrl"]',
  },
  {
    name: 'feature_announcement',
    category: 'marketing',
    subjectEn: 'New on Sqordia: {{featureName}}',
    subjectFr: 'Nouveau sur Sqordia : {{featureName}}',
    bodyEn: marketingEn,
    bodyFr: marketingFr,
    variablesJson: '["firstName","featureName","featureDescription","benefit1","benefit2","benefit3","actionUrl","unsubscribeUrl"]',
  },
  {
    name: 'payment_confirmation',
    category: 'billing',
    subjectEn: 'Payment confirmed — Invoice #{{invoiceNumber}}',
    subjectFr: 'Paiement confirmé — Facture n° {{invoiceNumber}}',
    bodyEn: billingEn,
    bodyFr: billingFr,
    variablesJson: '["firstName","email","planDescription","amount","taxAmount","totalAmount","invoiceNumber","paymentDate","paymentMethod","invoiceUrl","unsubscribeUrl"]',
  },
  {
    name: 'scheduled_maintenance',
    category: 'system',
    subjectEn: 'Scheduled Maintenance — {{maintenanceDate}}',
    subjectFr: 'Maintenance planifiée — {{maintenanceDate}}',
    bodyEn: systemEn,
    bodyFr: systemFr,
    variablesJson: '["firstName","maintenanceDate","maintenanceTime","maintenanceDuration","statusPageUrl","unsubscribeUrl"]',
  },
];
