import {z} from 'zod';

const AssetBase = z.object({
    id: z.string().min(1),
    account: z.string().min(1).optional(),
    quantity: z.coerce.number().nonnegative(),
    costBasis: z.coerce.number().nonnegative(),
    marketValue: z.coerce.number().nonnegative().optional(),
});

const StockLike = AssetBase.extend({
    assetType: z.literal("stock").or(z.literal("fund")),
    symbol: z.string().min(1), //ticker
    meta: z
    .object({
        exchange: z.string().optional(),
        dividendYield: z.coerce.number().nonnegative().optional(),
    })
    .optional(),
});

const Crypto = AssetBase.extend({
    assetType: z.literal("Crypto"),
    symbol: z.string().min(1), // Coin symbol 
    meta: z
    .object({
        chain: z.string().optional(),
        wallet: z.string().optional(),
    })
    .optional(),
});

const Bond = AssetBase.extend({
    assetType: z.literal("bond"),
    symbol: z.string().min(1),
    meta: z
    .object({
        coupon: z.coerce.number().min(0),
        maturityDate: z.coerce.date(), // use new Date(input) in controllers
        parValue: z.coerce.number().positive(),
    })
});

const RealEstate = AssetBase.extend({
    assetType: z.literal("real_estate"),
    symbol: z.string().min(1), // e.g. "House A or beach home"
    quantity: z.literal(1).default(1),
    meta: z.object({
        address: z.string().optional(),
        currentEstimate: z.coerce.number().nonnegative(),
        mortgageBalance: z.coerce.number().nonnegative().default(0),
        mortgageRate: z.coerce.number().min(0).max(100).default(0),
    })
});

const HYSA = AssetBase.extend({
    assetType: z.literal("hysa").or(z.literal("cash")),
    symbol: z.string().min(1), //bank account nickname e.g amex hysa
    meta: z.object({
        institution: z.string().optional(),
        apy: z.coerce.number().min(0).max(100).optional(),
    })
    .optional(),
});

// Discrimination union (by assetType)
export const AssetSchema = z.discriminatedUnion("assetType", [
    StockLike,
    Crypto,
    Bond,
    RealEstate,
    HYSA,
]);

export const AssetsArraySchema = z.array(AssetSchema);

export type Asset = z.infer<typeof AssetSchema>;
export type AssetType = Asset["assetType"];
