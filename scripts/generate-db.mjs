/**
 * Regenerates db.json (the json-server database) with the original sample data.
 *
 *   npm run seed
 *
 * Run it whenever you want to reset products, team, events and mail back to
 * their starting state. Stop `npm run api` first, otherwise json-server may
 * write its in-memory copy back over the fresh file.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// ---------------------------------------------------------------- products
const P = '/img/products/'
const products = [
  ['Apple Watch Series 4', 'Watches', 120.0, 4, 131, true, P + 'apple-watch-midnight.png'],
  ['Apple Watch Series 5', 'Watches', 149.0, 5, 98, false, P + 'apple-watch-starlight.png'],
  ['Air-Max-270', 'Shoes', 60.0, 4, 64, false],
  ['Minimal Chair Tool', 'Home', 24.59, 5, 63, true],
  ['Amazfit Vip', 'Watches', 79.95, 4, 42, false],
  ['Gumbo Mouse', 'Accessories', 22.49, 4, 87, false],
  ['Camera Tripod', 'Electronics', 54.0, 5, 29, false, P + 'camera.png'],
  ['Microsoft Headsquare', 'Electronics', 190.0, 4, 108, false, P + 'microsoft-headsquare.png'],
  ["Women's Dress", 'Fashion', 640.0, 5, 76, false, P + 'womens-dress.png'],
  ['Samsung A50', 'Mobile', 400.0, 4, 51, false, P + 'samsung-a50.png'],
  ['Beats Headphone 2019', 'Electronics', 89.0, 5, 212, false],
  ['Sony WH-1000XM3', 'Electronics', 248.0, 5, 340, false],
  ['Levi’s 511 Slim Jeans', 'Fashion', 58.0, 4, 154, false],
  ['Nike Pegasus 36', 'Shoes', 120.0, 4, 187, false],
  ['Adidas Ultraboost', 'Shoes', 180.0, 5, 265, false],
  ['Leather Wallet', 'Accessories', 34.5, 4, 73, false],
  ['Canvas Backpack', 'Accessories', 46.0, 4, 91, false],
  ['Ceramic Coffee Mug Set', 'Home', 28.99, 5, 118, false],
  ['Table Lamp Nordic', 'Home', 39.9, 4, 45, false],
  ['Bluetooth Speaker Mini', 'Electronics', 35.0, 4, 203, false],
  ['Mechanical Keyboard', 'Accessories', 89.99, 5, 156, false],
  ['Fitness Band 3', 'Watches', 44.0, 3, 67, false],
  ['iPhone 11 Case', 'Mobile', 15.99, 4, 310, false],
  ['Wireless Charger Pad', 'Mobile', 25.0, 4, 129, false],
  ['Yoga Mat Pro', 'Fitness', 32.0, 5, 84, false],
  ['Running Shorts', 'Fashion', 27.5, 4, 59, false],
  ['Sunglasses Aviator', 'Accessories', 69.0, 4, 102, false],
  ['Desk Organizer', 'Home', 19.99, 4, 38, false],
].map(([name, category, price, rating, reviews, favorite, image], index) => ({
  id: index + 1,
  name,
  category,
  price,
  rating,
  reviews,
  favorite,
  image: image || '',
}))

// -------------------------------------------------------------------- team
const T = '/img/team/'
const team = [
  ['Jason Price', 'Admin', 'janick_parisian@yahoo.com', 'jason-price'],
  ['Jukkoe Sisao', 'CEO', 'sibyl_kozey@gmail.com', 'jukkoe-sisao'],
  ['Harriet King', 'CTO', 'nadia_block@hotmail.com', 'harriet-king'],
  ['Lenora Benson', 'Lead', 'feil.wallace@kunde.us', 'lenora-benson'],
  ['Olivia Reese', 'Strategist', 'kemmer.hattie@cremin.us', 'olivia-reese'],
  ['Bertha Valdez', 'CEO', 'loraine.koelpin@tromp.io', 'bertha-valdez'],
  ['Harriett Payne', 'Digital Marketer', 'nannie_west@estrella.tv', 'harriett-payne'],
  ['George Bryant', 'Social Media', 'delmer.kling@gmail.com', 'george-bryant'],
  ['Lily French', 'Strategist', 'lucienne.herman@hotmail.com', 'lily-french'],
  ['Howard Adkins', 'CEO', 'wiegand.leonor@herman.us', 'howard-adkins'],
  ['Earl Bowman', 'Digital Marketer', 'waino_altenwerth@nicolette.tv', 'earl-bowman'],
  ['Patrick Padilla', 'Social Media', 'octavia.nienow@gleichner.net', 'patrick-padilla'],
].map(([name, role, email, file], index) => ({
  id: index + 1,
  name,
  role,
  email,
  phone: '',
  gender: '',
  avatar: `${T}${file}.png`,
}))

// ------------------------------------------------------------------ events
const E = '/img/events/'
const events = [
  { id: 1, title: 'Design Conference', host: 'Zillul Design Agency', date: '2019-10-03', endDate: '2019-10-03', time: '07:19', address: '56 Davion Mission Suite 157', place: 'Meaghanberg', guests: 15, color: '#6226EF', image: '' },
  { id: 2, title: 'Weekend Festival', host: 'Sound Republic', date: '2019-10-16', endDate: '2019-10-16', time: '17:00', address: '853 Moore Flats Suite 158', place: 'Sweden', guests: 20, color: '#E93CAC', image: E + 'weekend-festival.png' },
  { id: 3, title: 'Glastonbury Festival', host: 'Glastonbury Ltd', date: '2019-10-20', endDate: '2019-10-22', time: '20:00', address: '646 Walter Road Apt. 571', place: 'Turks and Caicos Islands', guests: 14, color: '#FFA756', image: E + 'glastonbury-festival.png' },
  { id: 4, title: 'Ultra Europe 2019', host: 'Ultra Worldwide', date: '2019-10-25', endDate: '2019-10-25', time: '22:00', address: '506 Satterfield Tunnel Apt. 963', place: 'San Marino', guests: 42, color: '#2E5BFF', image: E + 'ultra-europe.png' },
]

// -------------------------------------------------------------------- mail
const subjects = {
  commerce: 'Our Bachelor of Commerce program is ACBSP-accredited.',
  advertiser: 'Get Best Advertiser In Your Side Pocket',
  vacation: 'Vacation Home Rental Success',
  classifieds: 'Free Classifieds Using Them To Promote Your Stuff Online',
  blimps: 'Enhance Your Brand Potential With Giant Advertising Blimps',
  bright: 'Always Look On The Bright Side Of Life',
  curling: 'Curling Irons Are As Individual As The Women Who Use Them',
}
const mk = (id, sender, label, subject, time, extra = {}) => ({
  id, sender, label, subject, time, starred: false, important: false, folder: 'inbox', ...extra,
})
const mails = [
  mk(1, 'Jullu Jalal', 'Primary', subjects.commerce, '8:38 AM', { important: true }),
  mk(2, 'Minerva Barnett', 'Work', subjects.advertiser, '8:13 AM'),
  mk(3, 'Peter Lewis', 'Friends', subjects.vacation, '7:52 PM'),
  mk(4, 'Anthony Briggs', null, subjects.classifieds, '7:52 PM', { starred: true }),
  mk(5, 'Clifford Morgan', 'Social', subjects.blimps, '4:13 PM'),
  mk(6, 'Cecilia Webster', 'Friends', subjects.bright, '3:52 PM'),
  mk(7, 'Harvey Manning', null, subjects.curling, '2:30 PM', { starred: true, important: true }),
  mk(8, 'Willie Blake', 'Primary', subjects.commerce, '8:38 AM'),
  mk(9, 'Minerva Barnett', 'Work', subjects.advertiser, '8:13 AM'),
  mk(10, 'Fanny Weaver', null, subjects.classifieds, '7:52 PM', { starred: true }),
  mk(11, 'Olga Hogan', 'Social', subjects.blimps, '4:13 PM'),
  mk(12, 'Lora Houston', 'Friends', subjects.vacation, '7:52 PM'),
  mk(13, 'Duane Dean', 'Work', 'Re: Quarterly design review', 'Yesterday', { folder: 'sent' }),
  mk(14, 'Rosie Glover', 'Primary', 'Invoice for September', 'Yesterday', { folder: 'sent' }),
  mk(15, 'Jonathan Barker', null, 'Project kickoff notes', 'Mon', { folder: 'draft' }),
  mk(16, 'Win Big Lottery', null, 'You have been selected!!!', 'Sun', { folder: 'spam' }),
  mk(17, 'Cheap Meds Online', null, 'Limited time offer', 'Sat', { folder: 'spam' }),
  mk(18, 'Darrell Ortega', 'Social', 'Weekend plans', 'Fri', { folder: 'bin' }),
]

const lorem = [
  'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.',
  'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.',
  "The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default.",
]
let messageId = 1
const messages = mails.flatMap((mail) => [
  { id: messageId++, mailId: mail.id, from: 'them', time: '6.30 pm', text: lorem[0] },
  { id: messageId++, mailId: mail.id, from: 'me', time: '6.34 pm', text: lorem[1] },
  { id: messageId++, mailId: mail.id, from: 'them', time: '6.38 pm', text: lorem[2] },
])

writeFileSync(
  join(root, 'db.json'),
  JSON.stringify({ products, team, events, mails, messages }, null, 2) + '\n',
)
console.log(
  `db.json written: ${products.length} products, ${team.length} team members, ${events.length} events, ${mails.length} mails.`,
)
