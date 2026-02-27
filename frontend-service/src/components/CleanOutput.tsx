export default function cleanOutput(text: string) {
    return text
        .replace(/(\*\*|\*|_|`|#+|<[^>]*>)/g, "")
        .replace(/[\u2022\u25CF\u25AA\u25AB\u25A0\u25A1]/g, "")
        .replace(/\s+\n/g, "\n")
        .trim();
}