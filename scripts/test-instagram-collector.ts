import { collectInstagramProfile } from "../lib/collectors/instagram";

async function main() {
  const username = process.argv[2] || "bonhomiaworld";
  const result = await collectInstagramProfile(username);

  console.log(
    JSON.stringify(
      {
        success: result.success,
        errors: result.errors,
        contactCount: result.contacts.length,
        contacts: result.contacts,
        profile: {
          displayName: result.data?.displayName,
          bio: result.data?.bio,
          websiteUrl: result.data?.websiteUrl,
          businessCategory: result.data?.businessCategory,
          location: result.data?.location,
          followerCount: result.data?.followerCount,
          hasContactButton: result.data?.hasContactButton,
          rawData: result.data?.rawData,
        },
      },
      null,
      2
    )
  );
}

main();
