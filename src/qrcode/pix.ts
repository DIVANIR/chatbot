// import QRCode from 'qrcode'

// // Função para gerar payload PIX com valor
// export function gerarPayloadPIX(chavePix:string, valor:number, nomeBeneficiario:string, cidade?:string) {
//   const value = valor.toFixed(2); // Garante 2 casas decimais
//   const payload = [
//     '000201',
//     '26580014BR.GOV.BCB.PIX',
//     `01${chavePix.length}${chavePix}`,
//     '52040000',
//     '5303986',
//     `54${value.length}${value}`,
//     '5802BR',
//     `59${nomeBeneficiario.length}${nomeBeneficiario}`,
//     //`60${cidade.length}${cidade}`,
//     '62070503***',
//     '6304'
//   ].join('');

//   // Calcula o CRC16 (checksum obrigatório)
//   const crc = calcularCRC16(payload);
//   return generateBase64QRCode(payload + crc)
// }

// // Função para calcular CRC16 (exigido pelo PIX)
// function calcularCRC16(payload:string) {
//   // Implementação simplificada (use uma lib como 'crc' em produção)
//   let crc = 0xFFFF;
//   for (let i = 0; i < payload.length; i++) {
//     crc ^= payload.charCodeAt(i) << 8;
//     for (let j = 0; j < 8; j++) {
//       crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
//     }
//   }
//   return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
// }

// const generateBase64QRCode = async (payload:string) => {
//     return await QRCode.toDataURL(payload,{
//         width: 300,
//             margin: 2,
//             color: {
//                 dark: '#000000',
//                 light: '#ffffff'
//             }
//     })
// }