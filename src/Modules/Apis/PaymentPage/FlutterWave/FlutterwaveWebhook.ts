import { Request } from "express";
const { FLUTTER_SECRET_HASH } = require("../../../../Config/Config")

const verifyFlutterwaveSignature = (req: Request): boolean => {
    const signature = req.headers['verif-hash'] as string;

    if (!signature) {
        console.error('No signature found in headers');
        return false;
    }

    // Compare with your secret hash
    return signature === FLUTTER_SECRET_HASH;
};

export default verifyFlutterwaveSignature;
