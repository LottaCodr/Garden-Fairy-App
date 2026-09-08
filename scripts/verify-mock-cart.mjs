// Exercises the real `store/cart.store.ts` + `lib/mock/cart.ts` code paths in
// plain Node (no browser, no backend). Run with:  npm run verify:mock-cart
//
// Covers:
//   A. API unreachable (nothing listening on :5000) -> auto-falls back to mock data
//   B. NEXT_PUBLIC_USE_MOCK_CART=1 -> forced mock, network never touched
//   C. NEXT_PUBLIC_USE_MOCK_CART=0 -> forced live, mock cart left untouched
//   D. a real API error (409) must NOT be swallowed by the mock fallback

import assert from "node:assert/strict";
import { register } from "node:module";

register(new URL("./ts-resolver.mjs", import.meta.url));

// --- minimal browser-ish environment ---------------------------------------
const storage = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
  },
};

let fetchCalls = 0;
let fetchImpl = async () => {
  throw new TypeError("fetch failed"); // what a browser throws when :5000 is closed
};
globalThis.fetch = async (...args) => {
  fetchCalls += 1;
  return fetchImpl(...args);
};

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: async () => body,
  };
}

const { useCartStore } = await import("@/store/cart.store");
const { mockGetCart, mockResetCart, MOCK_CART_STORAGE_KEY } = await import("@/lib/mock/cart");
const { isMockMode, resetMockMode } = await import("@/lib/mock/mode");

const state = () => useCartStore.getState();
let checks = 0;
async function check(label, fn) {
  await fn();
  checks += 1;
  console.log(`  ✓ ${label}`);
}

// ===========================================================================
console.log("\nA. API unreachable -> mock fallback");
// ===========================================================================
delete process.env.NEXT_PUBLIC_USE_MOCK_CART;
resetMockMode();
mockResetCart();
fetchCalls = 0;
fetchImpl = async () => {
  throw new TypeError("fetch failed");
};

await state().fetch();

await check("fetch() latches the store into mock mode", () => {
  assert.equal(isMockMode(), true);
  assert.equal(state().isMock, true);
  assert.equal(fetchCalls, 1);
});

await check("add to cart resolves name/price/image from the mock catalog", async () => {
  const res = await state().addItem("p01", 2);
  assert.equal(res.ok, true);
  const { items, count, subTotal } = state();
  assert.equal(items.length, 1);
  assert.equal(items[0].product, "p01");
  assert.equal(items[0].name, "Monstera Deliciosa");
  assert.equal(items[0].price, 7500);
  assert.equal(items[0].qty, 2);
  assert.equal(items[0].lineTotal, 15000);
  assert.equal(items[0].image, "/images/products/monstera-deliciosa.jpg");
  assert.equal(count(), 2);
  assert.equal(subTotal(), 15000);
});

await check("adding the same product again merges into one line", async () => {
  await state().addItem("p01", 1);
  assert.equal(state().items.length, 1);
  assert.equal(state().items[0].qty, 3);
  assert.equal(state().subTotal(), 22500);
});

await check("a different size gets its own line", async () => {
  await state().addItem("p02", 1, "large");
  assert.equal(state().items.length, 2);
  assert.equal(state().count(), 4);
  assert.equal(
    state().items.some((i) => i.product === "p02" && i.size === "large"),
    true,
  );
});

await check("adding by slug lands on the same canonical line", async () => {
  await state().addItem("monstera-deliciosa", 1);
  assert.equal(state().items.length, 2);
  assert.equal(state().items.find((i) => i.product === "p01").qty, 4);
});

await check("decrementItem steps the quantity down", async () => {
  const line = state().items.find((i) => i.product === "p01");
  await state().decrementItem(line.id);
  assert.equal(state().items.find((i) => i.product === "p01").qty, 3);
});

await check("decrementing to zero removes the line", async () => {
  const line = state().items.find((i) => i.product === "p02");
  await state().setQty(line.id, 1, line.size);
  await state().decrementItem(line.id);
  assert.equal(state().items.some((i) => i.product === "p02"), false);
});

await check("stock limit is enforced (p03 has 9 in stock)", async () => {
  const res = await state().addItem("p03", 20);
  assert.equal(res.ok, false);
  assert.match(res.error, /Only 9/);
  assert.equal(state().items.some((i) => i.product === "p03"), false);
});

await check("cart survives a reload (localStorage)", () => {
  const persisted = JSON.parse(storage.get(MOCK_CART_STORAGE_KEY));
  assert.deepEqual(
    persisted.items.map((i) => `${i.product}×${i.qty}`),
    ["p01×3"],
  );
  assert.equal(persisted.subtotal, 22500);
  assert.deepEqual(mockGetCart().items.map((i) => i.product), ["p01"]);
});

await check("removeItem + clearCart empty the cart", async () => {
  await state().addItem("p05", 2);
  const res = await state().removeItem("p05");
  assert.equal(res.ok, true);
  assert.equal(state().items.length, 1);
  await state().clearCart();
  assert.equal(state().items.length, 0);
  assert.equal(state().subTotal(), 0);
  assert.equal(state().count(), 0);
});

// ===========================================================================
console.log("\nB. NEXT_PUBLIC_USE_MOCK_CART=1 -> forced mock");
// ===========================================================================
process.env.NEXT_PUBLIC_USE_MOCK_CART = "1";
resetMockMode();
mockResetCart();
fetchCalls = 0;
fetchImpl = async () =>
  jsonResponse({ data: { id: "server-cart", items: [], subtotal: 0 } });

const forced = await state().addItem("p04", 1);

await check("adds without ever calling the network", () => {
  assert.equal(forced.ok, true);
  assert.equal(fetchCalls, 0);
  assert.equal(state().cart.id, "mock-cart");
  assert.equal(state().items[0].product, "p04");
});

// ===========================================================================
console.log("\nC. NEXT_PUBLIC_USE_MOCK_CART=0 -> forced live");
// ===========================================================================
process.env.NEXT_PUBLIC_USE_MOCK_CART = "0";
resetMockMode();
mockResetCart();
fetchCalls = 0;
fetchImpl = async () =>
  jsonResponse({
    data: {
      id: "server-cart",
      items: [
        {
          id: "line-1",
          product: "p09",
          name: "Server Plant",
          price: 12000,
          stock: 5,
          image: "/images/plants/1.jpg",
          qty: 1,
          lineTotal: 12000,
        },
      ],
      subtotal: 12000,
    },
  });

const live = await state().addItem("p09", 1);

await check("uses the API and leaves the mock cart alone", () => {
  assert.equal(live.ok, true);
  assert.ok(fetchCalls >= 1, "expected at least one API call");
  assert.equal(state().cart.id, "server-cart");
  assert.equal(state().items[0].name, "Server Plant");
  assert.equal(state().isMock, false);
  assert.equal(mockGetCart().items.length, 0);
});

// ===========================================================================
console.log("\nD. real API errors are not swallowed");
// ===========================================================================
delete process.env.NEXT_PUBLIC_USE_MOCK_CART;
resetMockMode();
mockResetCart();
fetchImpl = async () => jsonResponse({ msg: "Only 2 left in stock" }, 409);

const rejected = await state().addItem("p07", 5);

await check("surfaces the API error instead of falling back", () => {
  assert.equal(rejected.ok, false);
  assert.equal(rejected.error, "Only 2 left in stock");
  assert.equal(isMockMode(), false);
  assert.equal(mockGetCart().items.length, 0);
});

console.log(`\nAll ${checks} mock-cart checks passed.\n`);
process.exit(0);
