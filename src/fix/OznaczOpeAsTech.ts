import { IEnv } from "@src/core/oferta/tasks/IEnv";

export const oznaczOpeAsTech = async (ofertaId: string, version: number, env: IEnv) => {
    const ope = await env.opeService.load({ ofertaId, version });
    if (ope) {
        ope.updatedBy = 'tech';
        await env.opeService.save(ope);
    }
}
