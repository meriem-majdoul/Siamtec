export const roundPrice = (p) => {
    const roundedPrice = Number(p.toFixed(2))
    return roundedPrice
}

export const calculateSubTotal = (orderLines) => {
    let subTotal = 0
    for (const orderLine of orderLines) {
        subTotal = subTotal + orderLine.quantity * orderLine.price;
    }
    subTotal = roundPrice(subTotal)
    return subTotal
}

export const calucluateSubTotalOfProducts = (orderLines) => {
    const productsOrderLines = orderLines.filter(
        (orderLine) => orderLine.priority === 0,
    )
    let subTotalProducts = 0;
    for (const productsOrderLine of productsOrderLines) {
        const x = productsOrderLine.quantity * productsOrderLine.price;
        subTotalProducts = subTotalProducts + x
    }
    subTotalProducts = roundPrice(subTotalProducts)
    return subTotalProducts
}

export const calculateTaxes = (orderLines) => {
    const taxesTemp = orderLines.map((orderLine) => orderLine.taxe); //taxe = {name, rate, value} ; value = taxe*price*quantity
    var holder = {};

    //Sum up taxes with same rate
    taxesTemp.forEach(function (taxe) {
        if (holder.hasOwnProperty(taxe.name))
            holder[taxe.name] = holder[taxe.name] + Number(taxe.value);
        else holder[taxe.name] = Number(taxe.value);
    });

    var taxes = [];

    for (var prop in holder) {
        taxes.push({
            name: prop.toString(),
            value: holder[prop],
            rate: prop,
        });
    }

    return taxes;
}

export const sumTaxes = (taxes) => {
    const noTaxe = taxes.length === 0
    if (noTaxe) return 0;
    var taxeValues = taxes.map((taxe) => taxe.value);
    const sum = taxeValues.reduce((prev, next) => prev + next);
    return sum;
}

export const calculateDiscountValue = (subTotalProducts, discount) => {
    const discountValue = (subTotalProducts * discount) / 100;
    return discountValue
}

export const calculateTotalNetHT = (subTotal, discountValue) => {
    let totalNetHT = subTotal - discountValue
    console.log(typeof (subTotal), "subTotal;;;;;;;;")
    console.log(typeof (discountValue), "*discountValue////////////")
    totalNetHT = roundPrice(totalNetHT)
    return totalNetHT
}

export const calculateTotalTTC = (totalNetHT, taxes) => {
    const totalTaxes = sumTaxes(taxes)
    console.log(totalTaxes, "====", typeof (totalTaxes))

    let totalTTC = totalNetHT + totalTaxes
    console.log(typeof (totalNetHT), "+++++++")
    console.log(typeof (totalTaxes), "******")
    totalTTC = roundPrice(totalTTC)
    console.log("totalTTC", totalTTC)
    return totalTTC
}

export const calculateTotalNet = (totalTTC, primeCEE, primeRenov, aidRegion) => {
    const totalNet = totalTTC - primeCEE - primeRenov - aidRegion;
    return totalNet
}