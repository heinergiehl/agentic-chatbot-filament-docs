# Customer Data Guide

The signed-in order support recipe moved here from the [Quick Start](QUICKSTART.md) in 1.2.
Start with the anonymous FAQ path there; add customer data only after it works.

## Signed-in order support

Use a supported **server database** for production App data tools. SQLite App data tool queries run only in `local` and `testing`. This is a host integration recipe: `App\Models\Customer`, its `is_active` field, `stores()` relation and the order model/policy are examples you implement, not package classes.

### Host identity endpoint

Keep your normal customer login. A same-origin widget can use the host session when `api.include_session_auth_context` is enabled. An external embed needs an endpoint in the trusted Laravel host that issues signed context from its authenticated session.

Example for `routes/web.php`: replace the Agent ID and origin. This example grants only the `member` audience, requires an active customer and fixes identity to the host's Customer model. For a multi-tenant shop, also authorize the selected store server-side and pass its trusted tenant type/ID to the issuer. Do not accept identity or tenant from query parameters.

```php
use App\Models\Customer;
use Heiner\FilamentAgenticChatbot\Models\Bot;
use Heiner\FilamentAgenticChatbot\Support\WidgetContextToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/chat/customer-context', function (Request $request) {
    $headers = ['Cache-Control' => 'no-store, private', 'Pragma' => 'no-cache'];
    $customer = $request->user(); // use your customer guard if it is not the default

    if ($customer === null) {
        return response()->noContent(204, $headers);
    }

    abort_unless($customer instanceof Customer && $customer->is_active, 403);
    abort_unless($request->string('bot')->toString() === 'YOUR_AGENT_PUBLIC_ID', 403);
    abort_unless($request->string('area')->toString() === 'member', 403);
    $bot = Bot::query()->where('public_id', 'YOUR_AGENT_PUBLIC_ID')->firstOrFail();

    $issuance = WidgetContextToken::issueForBot(
        bot: $bot,
        origin: 'https://shop.example.com',
        area: 'member',
        actor: ['type' => 'customer', 'id' => (string) $customer->getKey()],
    ) ?? abort(503);

    return response()->json($issuance->toArray())->withHeaders($headers);
});
```

Configure `AGENTIC_CHATBOT_CONTEXT_ALLOWED_AREAS=public,member`, `AGENTIC_CHATBOT_WIDGET_CONTEXT_REQUIRED_AREAS=member` and `AGENTIC_CHATBOT_WIDGET_CONTEXT_AUTHORIZES_NON_PUBLIC_AREAS=true`. Set `AGENTIC_CHATBOT_WIDGET_SIGN_IN_ROUTE` to your host login route. Use `data-area="member"` and `data-context-endpoint="https://app.example.com/chat/customer-context"` on the embed. Cross-origin deployments need exact credentialed CORS and usable session cookies; browsers may block third-party cookies. Tokens are signed, not encrypted. Never include secrets. See [signed customer context](CHAT_WIDGET.md#signed-customer-and-tenant-context).

The customer context lifetime is controlled by `AGENTIC_CHATBOT_WIDGET_CONTEXT_TTL_MINUTES`; `AGENTIC_CHATBOT_WIDGET_SIGNING_TTL_MINUTES` controls the separate widget access token.

On login, logout or tenant switch, reload the page or call `await widget.refreshContext()` on your mounted SDK instance. A signed identity is not permanent authority.

### Record scopes and queue policy

1. Configure the host actor resolver before creating a personal App data tool. Merge this into `config/filament-agentic-chatbot.php`, keeping the other context settings:

```php
'host_actors' => [
    'types' => ['customer' => App\Models\Customer::class],
    'ability' => 'filament-agentic-chatbot.serve-customer',
],
```

The full configuration path is `filament-agentic-chatbot.context.host_actors.types`.

Keep the type map in the published configuration file, inside `context`; it is
supported by configuration cutover. Each mapped class must exist, extend
Eloquent `Model`, implement `Authenticatable` and be concrete. Package models
and their subclasses are forbidden. Aliases must match
`[a-z][a-z0-9_-]{0,63}` exactly: 1 to 64 characters, starting with a lowercase
letter, without whitespace or control characters. Each class may appear only
once, including alternate class-name casing or a leading backslash. A list of
distinct model classes is also supported for class-name identity types from
same-origin guards (ADR 0057); do not mix list entries and aliases.
Use a shared host `User` model only when it is intentionally your customer
identity model and the host ability restricts it accordingly. Panel membership
never supplies an implicit actor mapping.
Setup reports an invalid map, class or missing resolver ability as **Blocked**.
The entire invalid map is refused before any host actor or Gate is resolved;
it never opts into scope-only execution or silently overwrites an alias.

Signed context works together with session authentication, including a host
`customer` session guard and `AGENTIC_CHATBOT_API_INCLUDE_SESSION_AUTH_CONTEXT=true`.
The session model must match the class mapped to the signed alias, and its
authentication identifier must match the signed ID. A different customer or an
unmapped session model receives `403 widget_context_invalid`. When no session
user accompanies the request, the signed identity still authorizes the
configured member area. The signed alias stays in queued authority and scopes.

Exactly one valid mapping must name the session model; zero or multiple mappings
return `403 widget_context_invalid`, even for tokens issued from a user model
whose signed type is its class name. A tenant-only token does not exempt an
accompanying session from this check. There is no raw class-name fallback. In
`AppServiceProvider::boot()`, define the named ability. This example rejects
inactive accounts and checks any attested store membership:

```php
use App\Models\Customer;
use Heiner\FilamentAgenticChatbot\Support\HostActors\HostActorReference;
use Illuminate\Support\Facades\Gate;

Gate::define('filament-agentic-chatbot.serve-customer',
    fn (Customer $customer, HostActorReference $reference): bool =>
        (bool) $customer->is_active
        && ($reference->tenantId() === null
            || $customer->stores()->whereKey($reference->tenantId())->exists())
);
```

The resolver reloads the customer and rechecks that ability in the worker. Registered model policies run as that customer, not the worker's auth guard or an administrator. Register your Order model policy in the host app; for read-policy enforcement enable **Advanced > Check host policies for reads**, as described in [App data tools](DATA_RESOURCES.md#optional-host-policy-checks-for-reads). Custom tenancy context belongs in a host implementation of `Heiner\FilamentAgenticChatbot\Contracts\HostActorResolver`, including its `within()` scope.

2. In the Agent's Tools, add an App data tool for your host Order model, or import a Filament Resource proposal. Review it, then press **Save draft** on the Agent after saving the Tool.
3. Expose only the fields needed for Order status. Bind ownership to **both** `actor.id` and `actor.type`; bind tenant-owned records to `tenant.id` as well. When exactly one host actor type is configured, the Tool pins that type automatically. With several types, choose the intended type explicitly. Identity comes from trusted host context, never the customer's message.
4. Start with a read-only Tool. Verify the customer's own order, another customer's order, a guest, a disabled account, logout, tenant switch and delayed queue execution.
5. For delivery address changes, allow only the address fields, exact record identity and an optimistic version field. Use the order reference column as **Advanced > Changes > Record key** when it uniquely identifies the scoped order, so the confirmation card names that reference. Configure the host update policy and staging evidence described in [App data tools](DATA_RESOURCES.md#isolated-staging-evidence-before-publication). Publish the reviewed Tool assignments with the Agent.
6. Keep confirmation on. Personal App data tool writes require it. Verify Confirm, Cancel, stale record versions and duplicate submissions; reconcile an Unverified action before another write.
7. Verify Handoff notifications and an operator reply in the same conversation.

Confirmation is on by default. Administrators may disable **Ask visitor to confirm** for eligible operations; personal App data tool writes, MCP writes, lead capture and updates with **Allow updating any record** always require confirmation. Team approval remains separate. Disabling confirmation does not bypass authorization.

Do not enable personal Tools until identity, scopes, model policy and worker execution are verified in your staging host. Context expiry or revocation can stop personal work after a wait; see [Known limitations](KNOWN_LIMITATIONS.md#18-customer-identity-limits-adr-0057).

![Order Tool showing customer and tenant scopes with confirmation enabled](images/agentic-chatbot/w10-2-order-tool.png)

Review customer scopes and policy before enabling personal Tools.
