const username = process.argv[2] || "bonhomiaworld";
const profileUrl = `https://www.instagram.com/${username}/`;

const response = await fetch(profileUrl, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

const html = await response.text();

// Meta tags - both orders
const metas = [...html.matchAll(/<meta[^>]+>/g)].map((m) => m[0]);
const og = metas.filter((m) => m.includes("og:"));
console.log("og metas", og.slice(0, 8));

// Search for biography in escaped json
const bioMatches = [
  ...html.matchAll(/\\"biography\\":\\"((?:[^"\\]|\\.)*)\\"/g),
].slice(0, 3);
console.log("bio escaped", bioMatches.map((m) => m[1]?.slice(0, 100)));

const extMatches = [
  ...html.matchAll(/\\"external_url\\":\\"((?:[^"\\]|\\.)*)\\"/g),
].slice(0, 3);
console.log("external_url escaped", extMatches.map((m) => m[1]));

const fullNameMatches = [
  ...html.matchAll(/\\"full_name\\":\\"((?:[^"\\]|\\.)*)\\"/g),
].slice(0, 3);
console.log("full_name escaped", fullNameMatches.map((m) => m[1]));

const followers = html.match(/\\"edge_followed_by\\":\{\\"count\\":(\d+)\}/);
console.log("followers", followers?.[1]);

const following = html.match(/\\"edge_follow\\":\{\\"count\\":(\d+)\}/);
console.log("following", following?.[1]);

const posts = html.match(/\\"edge_owner_to_timeline_media\\":\{\\"count\\":(\d+)\}/);
console.log("posts", posts?.[1]);

const businessEmail = [
  ...html.matchAll(/\\"business_email\\":\\"((?:[^"\\]|\\.)*)\\"/g),
];
console.log("business_email", businessEmail.map((m) => m[1]));

const publicEmail = [
  ...html.matchAll(/\\"public_email\\":\\"((?:[^"\\]|\\.)*)\\"/g),
];
console.log("public_email", publicEmail.map((m) => m[1]));

const phone = [
  ...html.matchAll(/\\"contact_phone_number\\":\\"((?:[^"\\]|\\.)*)\\"/g),
];
console.log("phone", phone.map((m) => m[1]));

const category = html.match(/\\"category_name\\":\\"((?:[^"\\]|\\.)*)\\"/);
console.log("category", category?.[1]);

const isBusiness = html.match(/\\"is_business_account\\":(true|false)/);
console.log("is_business", isBusiness?.[1]);

// title tag
const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
console.log("title", title);

// Try web_profile_info API style endpoint
const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
const apiRes = await fetch(apiUrl, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "X-IG-App-ID": "936619743392459",
    "X-Requested-With": "XMLHttpRequest",
    Accept: "*/*",
    Referer: profileUrl,
  },
});
console.log("api status", apiRes.status);
if (apiRes.ok) {
  const data = await apiRes.json();
  const user = data?.data?.user;
  if (user) {
    console.log("api user keys", Object.keys(user));
    console.log("api full_name", user.full_name);
    console.log("api biography", user.biography?.slice(0, 120));
    console.log("api external_url", user.external_url);
    console.log("api business_email", user.business_email);
    console.log("api public_email", user.public_email);
    console.log("api contact_phone", user.business_phone_number || user.contact_phone_number);
    console.log("api category", user.category_name);
    console.log("api followers", user.edge_followed_by?.count);
  }
} else {
  console.log("api body", (await apiRes.text()).slice(0, 200));
}
