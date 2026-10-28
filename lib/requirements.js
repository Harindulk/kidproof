// The fixed checklist every policy is held against. Citations stop at section level on purpose.
// COPPA = 16 CFR Part 312 as amended in 2025; GDPR = Regulation (EU) 2016/679; UK Code = ICO Age Appropriate Design Code.
export const CHECKLIST_VERSION = '2026-10-28';

export const REQUIREMENTS = [
  {
    id: 'audience',
    title: 'Says who the service is for',
    look: 'Whether the policy states if the game or app is directed to children, to a mixed audience or to adults only, the age threshold it uses, and what it does when it learns a user is a child (age gate, age assurance, deleting data).',
    cites: ['COPPA §312.2 (directed to children)', 'GDPR Art. 8(1)', 'UK Code std 3'],
  },
  {
    id: 'parental_consent',
    title: "Gets a parent's consent first",
    look: 'Whether it obtains verifiable parental consent before collecting personal information from a child under 13 (or the GDPR age, 13 to 16 by country), and names the method used.',
    cites: ['COPPA §312.5', 'GDPR Art. 8(2)'],
  },
  {
    id: 'data_collected',
    title: 'Lists what it collects from children and why',
    look: 'Whether it lists the categories of personal information collected from children, including device and persistent identifiers, and the purpose of each, and collects no more than the game needs.',
    cites: ['COPPA §312.4', 'COPPA §312.7', 'GDPR Art. 13', 'UK Code std 8'],
  },
  {
    id: 'ads_tracking',
    title: 'Keeps ad tracking and profiling off children',
    look: 'Whether advertising IDs and other persistent identifiers are used for behavioural or targeted advertising or profiling of children, or only for internal operations and contextual ads.',
    cites: ['COPPA §312.2 (persistent identifiers)', 'COPPA §312.5', 'GDPR Recital 38', 'UK Code std 12'],
  },
  {
    id: 'third_parties',
    title: "Names who receives children's data",
    look: "Whether it names the third parties and SDKs (ad networks, analytics, cloud) that receive children's data, what they get, and whether a parent can agree to collection without agreeing to disclosure to third parties.",
    cites: ['COPPA §312.4', 'COPPA §312.5', 'UK Code std 9'],
  },
  {
    id: 'parental_rights',
    title: 'Tells parents how to review and delete',
    look: "Whether it tells parents how to review their child's data, have it deleted, and refuse further collection, and how to make that request.",
    cites: ['COPPA §312.6', 'GDPR Art. 15', 'GDPR Art. 17'],
  },
  {
    id: 'retention',
    title: 'Publishes how long data is kept',
    look: "Whether it states a written retention policy for children's data: how long each kind is kept, why, and when it is deleted.",
    cites: ['COPPA §312.10', 'GDPR Art. 5(1)(e)', 'GDPR Art. 13(2)(a)'],
  },
  {
    id: 'geolocation',
    title: 'Keeps location off or explains it',
    look: 'Whether precise or approximate location is collected from children, whether it is off by default, and whether the child can tell when it is on.',
    cites: ['COPPA §312.2 (geolocation)', 'UK Code std 10'],
  },
  {
    id: 'defaults',
    title: 'Starts children on high-privacy settings',
    look: 'Whether settings for children start at the most private option (public profiles, chat, sharing and personalisation off by default) and whether nudges push children to lower them.',
    cites: ['UK Code std 7', 'UK Code std 13', 'GDPR Art. 25'],
  },
  {
    id: 'plain_language',
    title: 'Explains itself in plain words',
    look: 'Whether the policy is written clearly enough for a parent, and the parts aimed at children in words a child could follow, without burying key facts in legal language.',
    cites: ['COPPA §312.4', 'GDPR Art. 12(1)', 'UK Code std 4'],
  },
  {
    id: 'operator_contact',
    title: "Gives the operator's contact details",
    look: 'Whether it names the company that runs the service and gives a postal address, an email and ideally a phone number for privacy questions.',
    cites: ['COPPA §312.4', 'GDPR Art. 13(1)(a)'],
  },
  {
    id: 'security',
    title: "Says how children's data is protected",
    look: "Whether it describes a security programme for children's data and requires third parties that receive it to protect it too.",
    cites: ['COPPA §312.8', 'GDPR Art. 32'],
  },
];
