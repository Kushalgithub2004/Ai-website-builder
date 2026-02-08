import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer>();

    async function main() {
        try {
            const webcontainerInstance = await WebContainer.boot();
            setWebcontainer(webcontainerInstance);
        } catch (error) {
            console.error("Failed to boot WebContainer:", error);
        }
    }

    useEffect(() => {
        main();
    }, [])

    return webcontainer;
}