export default class IsServerSideError extends Error
{
    constructor()
    {
        super('Sorry, VaComment does not support Server-side rendering.')
        this.name = 'IsServerSideError'
    }
}