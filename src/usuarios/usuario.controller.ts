import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
class UsuarioController {
    async adicionar(req: Request, res: Response) {
        const {nome,idade,email,senha} = req.body
        if(!nome || !email || !senha || !idade){
            return res.status(400).json({
                mensagem: "Por favor, preencha todos os campos obrigatórios",
                detalhes: "É necessário fornecer nome, email, senha e idade para criar uma conta"
            })
        }
        const senhaCriptografada = await bcrypt.hash(senha,10)
        const usuario = {nome,idade,email,senha:senhaCriptografada}
        const resultado = await db.collection('usuarios')
            .insertOne(usuario)
        res.status(201).json({ ...usuario, _id: resultado.insertedId })
    }
    async listar(req: Request, res: Response) {
        const usuarios = await db.collection('usuarios').find().toArray();
        res.status(200).json(usuarios);
    }
    async login(req: Request, res: Response){
        //Recebe email e senha
        const {email, senha} = req.body
        //Validação de email e senha
        if(!email||!senha) 
            return res.status(400).json({
                mensagem: "Campos obrigatórios não preenchidos",
                detalhes: "Por favor, informe seu email e senha para fazer login"
            })
        //Verifica se o usuário e senha estão corretos no banco.
        const usuario = await db.collection("usuarios").findOne({email})
        if(!usuario)
            return res.status(400).json({
                mensagem: "Credenciais inválidas",
                detalhes: "Email não encontrado. Por favor, verifique se digitou corretamente ou cadastre-se"
            })
        const senhaValida = await bcrypt.compare(senha,usuario.senha)
        if(!senhaValida)
            return res.status(400).json({
                mensagem: "Credenciais inválidas",
                detalhes: "Senha incorreta. Por favor, tente novamente"
            })
        //criar um TOKEN
        const token = 
        jwt.sign({usuarioId:usuario._id},process.env.JWT_SECRET!,{expiresIn:'1h'})
        //Devolver token
        res.status(200).json({token})
    }
}
export default new UsuarioController();