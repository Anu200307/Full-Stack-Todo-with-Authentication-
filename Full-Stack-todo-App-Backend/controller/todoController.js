const User = require("../model/User");
const Todo = require("../model/Todo");
const { success, z } = require("zod");
const jwt = require("jsonwebtoken");
const { de } = require("zod/locales");
require("dotenv").config();
const { enCrypt, deCrypt } = require("../security/cryptoImp");


exports.createTodo = async (req, res) => {
    const createTodoValidation = z.object(
        {
            title: z.string().min(2, { message: "please enter more then 10 character" }),
            body: z.string().min(3, { message: "please enter more then 20 character" })
        });
    try {
        const validationResult = createTodoValidation.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(500).json({ error: validationResult.error.issues[0].message });
        }
    } catch (error) {
        return res.status(500).json({ error: "Zod validation problem" });
    }

    try {
        const { title, body } = req.body;
        const email = req.user;
        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(500).json({ message: "User not exist" });
        }
        else {
            console.log(userExist._id);
            const encryptTitle = await enCrypt(title);
            const encryptBody = await enCrypt(body);
            const todo = new Todo({ title: encryptTitle, body: encryptBody, user: userExist._id });
            const saveTodo = await todo.save();

            await User.findByIdAndUpdate(userExist._id, { $push: { todos: saveTodo._id } }, { new: true });

            return res.status(201).json({ success: true, message: saveTodo });

        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.getAllTodos = async (req, res) => {
    try {
        const email = req.user;
        const userExist = await User.findOne({ email }).populate("todos");

        if (!userExist) {
            return res.status(500).json({ message: "User not exist" });
        }
        else {
            const allTodos = await Promise.all(
                userExist.todos.map(async (todo) => {
                    const title = await deCrypt(todo.title);
                    const body = await deCrypt(todo.body);
                    const complete = todo.complete;
                    return {
                        _id: todo._id,
                        title,
                        body,
                        date: todo.date,
                        complete:complete
                    };
                })
            );
            return res.status(200).json({ todos: allTodos });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "internal server failed" });
    }
};


exports.deleteTodo = async (req, res) => {
    try {
        const email = req.user;
        const { id: todoId } = req.query;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const verify = await Todo.findOne({ _id:todoId, user:user._id });
        if (verify) {
            const deletedTodo = await Todo.findByIdAndDelete(todoId);
            if (!deletedTodo) {
                return res.status(404).json({ message: "Todo not found" });
            }

            await User.findByIdAndUpdate(user._id, { $pull: { todos: verify._id } }, { new: true });
            return res.status(200).json({ message: "Todo deleted successfully" });
        }
        else{
            return res.status(500).json({ message: "It is not your post" });
        }


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// exports.updateTodo = async (req, res) => {
//     try {
//         const email = req.user;
//         const { id: todoId } = req.query;
//         const { title, body } = req.body;

//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         const verify = await Todo.findOne({ _id: todoId, user: user._id });
//         if (!verify) {
//             return res.status(403).json({ message: "It is not your post" });
//         }

//         const encryptTitle = await enCrypt(title);
//         const encryptDescription = await enCrypt(body);
//         console.log(enCrypt)

//         const encryptedTitle = encryptTitle ? encryptTitle : verify.title;
//         const encryptedBody = encryptDescription ? encryptDescription : verify.body;
//         if(verify.complete)
//         {
//             return res.json(401).json({message:"Please Mark Incomplete"})
//         }
//         const updatedTodo = await Todo.findByIdAndUpdate(
//             todoId,
//             {
//                 title: encryptedTitle,
//                 body: encryptedBody,
//             },
//             { new: true }
//         );

//         return res.status(200).json({ message: "Todo updated successfully", updatedTodo });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

exports.updateTodo = async (req, res) => {
    try {
        const email = req.user;
        const { id: todoId } = req.query;
        const { title, body } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const verify = await Todo.findOne({ _id: todoId, user: user._id });
        if (!verify) {
            return res.status(403).json({ message: "It is not your post" });
        }

        if (verify.complete) {
            return res.status(401).json({ message: "Please Mark Incomplete" });
        }

        const encryptTitle = await enCrypt(title);
        const encryptDescription = await enCrypt(body);

        const encryptedTitle = encryptTitle || verify.title;
        const encryptedBody = encryptDescription || verify.body;

        const updatedTodo = await Todo.findByIdAndUpdate(
            todoId,
            {
                title: encryptedTitle,
                body: encryptedBody,
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Todo updated successfully",
            updatedTodo,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.checkedMark = async (req, res) => {
    const { id } = req.query;
    try {
        await Todo.findByIdAndUpdate(id, { complete: true });
        return res.status(200).json({ message: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: false, error: error });
    }
};


exports.unCheckMark = async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Todo ID is required' });
    }

    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            { complete: false },
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        return res.status(200).json({ message: 'Todo marked as incomplete', todo: updatedTodo });
    } catch (error) {
        console.error('Error updating todo:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
