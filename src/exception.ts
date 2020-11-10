export class ServerSideError extends Error
{
    constructor()
    {
        super('Sorry, Valine does not support Server-side rendering.')
        this.name = 'ServerSideError'
    }
}

export class EmptyConfigurationStruct extends Error
{
    constructor()
    {
        super('Please give at least one parameter.')
        this.name = 'EmptyConfigurationStruct'
    }
}

