import { useAppContext } from "../app/AppContext"

export default function Home() {

    const { userState } = useAppContext();

    console.log('userState: ', userState);

    return (
        <div>
            <p>Hello World { userState?.user?.displayName }</p>
            <a href="/login">Login</a>
            <br/>
            <a href="/signup">Signup</a>
        </div>
        
    )
}