module.exports = async function (Server) {
  Server.BLOCKS_TO_PROCESS_IDS = [
    "0x12207cab0c9500411004288e5b4832e5d5b680eeca14de5a2046d524bb6ea8d167ba",
    "0x1220ce6fcbab496a7654f9c646647cb385fac76257053e732104941ea63ec06002e3",
  ];

  /* Server.BLOCKS_TO_PROCESS = (
    await Server.client.blockStore.getBlocksById([
      "0x12207cab0c9500411004288e5b4832e5d5b680eeca14de5a2046d524bb6ea8d167ba",
      "0x1220ce6fcbab496a7654f9c646647cb385fac76257053e732104941ea63ec06002e3",
    ])
  ).block_items;

  const fs = require("fs");
  const util = require("util");

  // Log each block in a json file for testing with the name block_id.json
  Server.BLOCKS_TO_PROCESS.forEach((block) => {
    let filePath =
      __dirname + "/../logs/test_blocks/" + block.block_id + ".json";
    Server.logStream = fs.createWriteStream(filePath, {
      flags: "w",
    });
    Server.logStream.write(JSON.stringify(block));
    Server.logStream.close();
  }); */

  /*
      "0x122030a5d4689188507943cf471abbc2835f2c59e36aabdf926b603eaabfb29660d1",
      "0x12209a2c26558f6ae8ea2cab7b62d783a8eb14cb010cb3ff4c2f3eb90368127b840f",
      "0x1220225f138666953af6ea711f1ef198bcf9671d4c0ebe0f4587164cd69f3112a297",
      "0x1220b1d5e9d86aeecefc434fadabe1486aac2863b513fdc95e0fe7a63fd66d5a5b62",
      "0x1220d8cbd6218400aad40e509aa33f0486d4defa30d7edf6cf2a0ef4c493f559d35d",
      "0x12206377f582a6ef66b1faae534a4254131b48e32d3552f33510a036a53d60a624e4",
      "0x12206e1649e4b457432b8674da4d47ef8befd708c7275cab8e167c0864d23e74321c",
      "0x1220dc7cd18484fe50f67708f41a0750c41acafb10350c1a2ecd606bc34254c221bb",
      "0x122011e9148f7a49022ade554e4b1ef4acfec90375362505d853fd430691efb0e32a",
      "0x122028312d1f3530245ae6078b301087461406673c9778007818051aa3627bf60681",
      "0x122051535421c5b45476d2ff7c8e8259db4e7f8bf2a4cc64be50e49b052d57d30c1e",
      "0x122091c13e8cc5998ab76b7e3803f05a5895f3e29f37ee5a3d8c131dba2632d0267e",
      "0x12204a7d0dde95b06676981c240f083e57f46879cf296f71d6e8a961253aa832eaf1",
      "0x122069b18f9361a12d54b11d8a29fcff69449bad2e443aa967e90f31e9e39710b79f",
      "0x1220f393c93b8c19f954e279235ef15ea800f29db9238dc9044b312c15ecec8f7484",
      "0x1220220975c571a0943a52bf3d84557b93ec1ed4438ec10345488b2ee1c5a21e5c83",
      "0x12205f418fe4699f1e698ffa1eb72c967d3fb3f21f86477bd2a11076fd2bec5c584a",
      "0x12207f7ec6af483950829c3827a4ce413c31a9916fcbaa70b7d4e60fe39d22b198bb",
      "0x12205e4d6d004bf045590e4ae25e0b32a2c78e826c73a6c52411399a39b7202971ed",
      "0x1220f977bf403a48bd00eb7d904bedebe6c8e82af5a5688b092631fd369c7e5cc5b4",
      "0x1220abbd2134a96026764b380213d529ee7f5ad16e70b7fd7f4b6bfd709364f1ca14",
       "0x12207cab0c9500411004288e5b4832e5d5b680eeca14de5a2046d524bb6ea8d167ba",
      "0x1220ce6fcbab496a7654f9c646647cb385fac76257053e732104941ea63ec06002e3",
  */
};