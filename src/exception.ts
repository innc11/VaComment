export class ServerSideError extends Error
{
    constructor()
    {
        super('Sorry, Valine does not support Server-side rendering.')
        this.name = 'ServerSideError'
    }
}

export class MissingNecessaryFieldError extends Error
{
    constructor(fieldName: string)
    {
        super('The parameter of "'+fieldName+'" must be given.')
        this.name = 'MissingNecessaryFieldError'
    }
}

