const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createAccount = async () => {
    const account = await stripe.accounts.create({
        type: "express",
        country: "SG",
        capabilities: {
            card_payments: {requested: true},
            transfers: {requested: true}
        }
    })
    return account;
}

const createLinkForOnboard = async (accountId) => {
    const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: "https://travelties-fce2c.web.app?state=refresh",
        return_url: "https://travelties-fce2c.web.app?state=complete",
        type: "account_onboarding"
    });
    return link.url;
}

const createLinkForUpdate = async (accountId) => {
    const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: "https://travelties-fce2c.web.app?state=refresh",
        return_url: "https://travelties-fce2c.web.app?state=complete",
        type: "account_update"
    });
    return link.url;
}

const getAccountDetails = async (accountId) => {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
}

const disconnectAccount = async (accountId) => {
    await stripe.accounts.del(accountId);
}

module.exports = {
    createAccount,
    createLinkForOnboard,
    createLinkForUpdate,
    getAccountDetails,
    disconnectAccount
}