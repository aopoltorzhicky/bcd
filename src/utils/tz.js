import BigNumber from "bignumber.js";

var bs58check = require("bs58check");
var dayjs = require("dayjs");

export function checkAddress(address) {
    if (address === undefined && address == null) return false;
    if (typeof address !== "string") return false;
    if (address.length !== 36 && !address.startsWith("KT")) return false;
    try {
        if (bs58check.decode(address) === undefined) return false;
    } catch (e) {
        return false;
    }
    return true;
}

export function checkOperation(operation) {
    if (operation === undefined && operation == null) return false;
    if (typeof operation !== "string") return false;
    if (operation.length != 51 && !operation.startsWith("o")) return false;
    if (bs58check.decode(operation) === undefined) return false;
    return true;
}

export function checkKeyHash(keyhash) {
    if (keyhash === undefined && keyhash == null) return false;
    if (typeof keyhash !== "string") return false;
    if (keyhash.length != 54 && !keyhash.startsWith("expr")) return false;
    if (bs58check.decode(keyhash) === undefined) return false;
    return true;
}

export function shortcut(value, tail = 4) {
    if (!value) return '';

    let head = 0;
    if (value.startsWith('tz') || value.startsWith('KT')) {
        head = 3
    } else if (value.startsWith('o')) {
        head = 1;
    } else if (value.startsWith('expr')) {
        head = 4;
    } else {
        return value;
    }
    return `<span class="font-weight-light">${value.slice(0, head)}</span>` +
        `${value.slice(head, head + tail)}` +
        `<i class="v-icon notranslate mdi mdi-dots-horizontal" style="font-size: 16px;"></i>` +
        `${value.slice(value.length - tail)}`
}

export function formatDatetime(timestamp, minDate = { val: 1, unit: "day", isArticle: true }) {
    let d = dayjs(timestamp);
    if (timestamp) {
        if (d.year() < dayjs().year()) return d.format("D MMM'YY HH:mm");
        if (d.add(minDate.val, minDate.unit).isBefore(dayjs())) return d.format("D MMM HH:mm");
        if (minDate.isArticle) {
            return d.fromNow();
        } else {
            if (d.fromNow().indexOf('a ') === 0) {
                return d.fromNow().substring(2);
            }
            return d.fromNow();
        }
    }
}

export function formatDate(timestamp) {
    let d = dayjs(timestamp);
    if (timestamp) {
        if (d.year() < dayjs().year()) return d.format("D MMM'YY");
        if (d.add(1, "days").isBefore(dayjs())) return d.format("D MMM");
        return d.fromNow();
    }
}

export function plural(count, noun, suffix = 's') {
    return `${count} ${noun}${count !== 1 ? suffix : ''}`;
}

export function urlExtractBase58(url) {
    const matches = url.match(/\b(tz|KT|o|expr)[1-9A-HJ-NP-Za-km-z]{34,}\b/);
    if (matches && matches.length > 0) {
        return matches[0];
    }
}

export function numberToLocalizeString(number, maximumFractionDigits) {
    if (maximumFractionDigits >= 0 && maximumFractionDigits <= 20) {
        return number.toLocaleString(undefined, {
            maximumFractionDigits
        });
    } else {
        const stringed = String(number);
        const intPart = stringed.substring(0, stringed.indexOf('.'));
        if (maximumFractionDigits === 0) {
            return intPart;
        }
        return new BigNumber(number).precision(intPart.length + maximumFractionDigits);
    }
}

export function round(value, decimals) {
    if (decimals > 20) {
        return parseFloat(new BigNumber(value).toFixed(decimals));
    }
    return parseFloat((value / 10 ** decimals).toFixed(decimals));
}
