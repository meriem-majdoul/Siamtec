
export const getPropsFromModel = (model) => {
    let properties = []
    let initialState = {}

    for (const page of model) {
        page.fields.forEach((field) => {
            properties.push(field.id)
            if (field.isMultiOptions)
                initialState[field.id] = []
            else initialState[field.id] = ""
        })
    }

    return { properties, initialState }
}